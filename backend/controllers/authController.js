const bcrypt = require('bcrypt');
const crypto = require('crypto');

const pool = require('../config/db');
const AuthModel = require('../models/authModel');
const UserManagementModel = require('../models/userManagementModel');
const RoleModel = require('../models/roleModel');
const { signAccessToken } = require('../middleware/authMiddleware');
const { getMergedPermissions } = require('../middleware/permissionMiddleware');
const { logAudit } = require('../middleware/auditMiddleware');
const SIDEBAR_CONFIG = require('../config/sidebarConfig');

const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10);
const REFRESH_COOKIE_NAME = 'refreshToken';
const MAX_FAILED_ATTEMPTS = 5;

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
        path: '/api/auth',
    };
}

function sanitizeUser(user) {
    return {
        id: user.id,
        user_code: user.user_code,
        employee_id: user.employee_id,
        employee_name: user.employee_name,
        username: user.username,
        email: user.email,
        department: user.department,
        plant: user.plant,
        role: user.role,
        role_id: user.role_id,
    };
}

async function resolveUserRoleId(user) {
    if (user?.role_id) return user.role_id;
    if (!user?.role) return null;

    const role = await RoleModel.getRoleByName(user.role);
    const resolvedRoleId = role?.id || null;

    if (resolvedRoleId && user?.id && !user?.role_id) {
        await pool.query('UPDATE users SET role_id = ? WHERE id = ?', [resolvedRoleId, user.id]);
    }

    return resolvedRoleId;
}

async function issueRefreshToken(res, user, req) {
    const rawToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    await AuthModel.createRefreshToken({
        userId: user.id,
        tokenHash,
        expiresAt,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
    });

    res.cookie(REFRESH_COOKIE_NAME, rawToken, refreshCookieOptions());
}

async function buildPermissionsAndSidebar(userId, roleId) {
    const permissions = await getMergedPermissions(userId, roleId);
    const viewable = new Set(
        permissions.filter((p) => p.can_view).map((p) => p.module_name)
    );

    const sidebar = SIDEBAR_CONFIG
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => viewable.has(item.module)),
        }))
        .filter((group) => group.items.length > 0);

    const modules = Array.from(viewable);

    return { permissions, sidebar, modules };
}

class AuthController {

    // ==========================================================
    // Login
    // ==========================================================

    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username/email and password are required.',
                });
            }

            const user = await AuthModel.getUserByUsername(username);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.',
                });
            }

            if (user.status === 'Locked' && user.locked_until && new Date(user.locked_until) > new Date()) {
                return res.status(423).json({
                    success: false,
                    message: 'Account locked due to too many failed login attempts. Try again later or contact an administrator.',
                });
            }

            if (user.status === 'Disabled') {
                return res.status(403).json({
                    success: false,
                    message: 'This account has been disabled. Contact an administrator.',
                });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                const attempts = await AuthModel.incrementFailedAttempts(user.id);

                await AuthModel.createLoginHistory({
                    userId: user.id,
                    ip: req.ip,
                    browser: req.headers['user-agent'],
                    status: 'Failed',
                    remarks: 'Invalid password',
                });

                await logAudit(req, {
                    user_id: user.id,
                    module_name: 'Authentication',
                    action: 'FAILED_LOGIN',
                    description: `Failed login attempt for ${user.username} (attempt ${attempts}).`,
                });

                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    await AuthModel.lockUser(user.id);
                    return res.status(423).json({
                        success: false,
                        message: 'Account locked due to too many failed login attempts. Try again later or contact an administrator.',
                    });
                }

                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.',
                });
            }

            await AuthModel.resetFailedAttempts(user.id);
            await AuthModel.updateLastLogin(user.id);

            await AuthModel.createLoginHistory({
                userId: user.id,
                ip: req.ip,
                browser: req.headers['user-agent'],
                status: 'Success',
            });

            const resolvedRoleId = await resolveUserRoleId(user);
            const userForSession = { ...user, role_id: resolvedRoleId };
            const accessToken = signAccessToken(userForSession);
            await issueRefreshToken(res, userForSession, req);

            const { permissions, sidebar, modules } = await buildPermissionsAndSidebar(user.id, resolvedRoleId);

            req.user = { id: user.id, username: user.username, role: user.role, role_id: resolvedRoleId };
            await logAudit(req, {
                module_name: 'Authentication',
                action: 'LOGIN',
                description: `${user.username} logged in.`,
            });

            return res.status(200).json({
                success: true,
                message: 'Login successful.',
                data: {
                    accessToken,
                    user: sanitizeUser(userForSession),
                    permissions,
                    modules,
                    sidebar,
                },
            });
        } catch (error) {
            console.error('LOGIN ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to log in.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Logout
    // ==========================================================

    static async logout(req, res) {
        try {
            const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

            if (rawToken) {
                const tokenHash = hashToken(rawToken);
                const tokenRow = await AuthModel.findRefreshTokenByHash(tokenHash);
                if (tokenRow) {
                    await AuthModel.revokeRefreshToken(tokenRow.id);
                }
            }

            res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });

            await logAudit(req, {
                module_name: 'Authentication',
                action: 'LOGOUT',
                description: `${req.user.username} logged out.`,
            });

            return res.status(200).json({ success: true, message: 'Logged out successfully.' });
        } catch (error) {
            console.error('LOGOUT ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to log out.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Refresh Token
    // ==========================================================

    static async refreshToken(req, res) {
        try {
            const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

            if (!rawToken) {
                return res.status(401).json({ success: false, message: 'No active session.' });
            }

            const tokenHash = hashToken(rawToken);
            const tokenRow = await AuthModel.findRefreshTokenByHash(tokenHash);

            if (!tokenRow) {
                res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
                return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
            }

            const user = await UserManagementModel.getUserById(tokenRow.user_id);

            if (!user || user.status !== 'Active') {
                await AuthModel.revokeRefreshToken(tokenRow.id);
                res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
                return res.status(401).json({ success: false, message: 'Session no longer valid. Please log in again.' });
            }

            // Rotate: revoke the presented token, issue a new one.
            const resolvedRoleId = await resolveUserRoleId(user);
            const userForSession = { ...user, role_id: resolvedRoleId };
            await AuthModel.revokeRefreshToken(tokenRow.id);
            await issueRefreshToken(res, userForSession, req);

            const accessToken = signAccessToken(userForSession);

            return res.status(200).json({
                success: true,
                data: { accessToken, user: sanitizeUser(userForSession) },
            });
        } catch (error) {
            console.error('REFRESH TOKEN ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to refresh session.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Get Current User
    // ==========================================================

    static async getMe(req, res) {
        try {
            const user = await UserManagementModel.getUserById(req.user.id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            return res.status(200).json({ success: true, data: sanitizeUser(user) });
        } catch (error) {
            console.error('GET ME ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to fetch current user.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Get Permissions
    // ==========================================================

    static async getPermissions(req, res) {
        try {
            const resolvedRoleId = req.user.role_id || await resolveUserRoleId(req.user);
            const { permissions } = await buildPermissionsAndSidebar(req.user.id, resolvedRoleId);
            return res.status(200).json({ success: true, data: permissions });
        } catch (error) {
            console.error('GET PERMISSIONS ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to fetch permissions.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Get Sidebar
    // ==========================================================

    static async getSidebar(req, res) {
        try {
            const { sidebar } = await buildPermissionsAndSidebar(req.user.id, req.user.role_id);
            return res.status(200).json({ success: true, data: sidebar });
        } catch (error) {
            console.error('GET SIDEBAR ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to fetch sidebar.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Assign Role (Admin only)
    // ==========================================================

    static async assignRole(req, res) {
        try {
            const { id } = req.params;
            const { role_id } = req.body;

            if (!role_id) {
                return res.status(400).json({ success: false, message: 'role_id is required.' });
            }

            const [targetUser, role] = await Promise.all([
                UserManagementModel.getUserById(id),
                RoleModel.getRoleById(role_id),
            ]);

            if (!targetUser) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            if (!role) {
                return res.status(404).json({ success: false, message: 'Role not found.' });
            }

            await pool.query(
                `UPDATE users SET role_id = ?, role = ?, updated_by = ? WHERE id = ?`,
                [role.id, role.role_name, req.user.username, id]
            );

            await logAudit(req, {
                user_id: id,
                module_name: 'User Management',
                action: 'ROLE_CHANGE',
                description: `Role for ${targetUser.username} changed from "${targetUser.role}" to "${role.role_name}".`,
                old_data: { role: targetUser.role, role_id: targetUser.role_id },
                new_data: { role: role.role_name, role_id: role.id },
            });

            return res.status(200).json({ success: true, message: 'Role assigned successfully.' });
        } catch (error) {
            console.error('ASSIGN ROLE ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to assign role.',
                error: error.message,
            });
        }
    }

    // ==========================================================
    // Change Password (User Self-Service)
    // ==========================================================

    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password, new password, and confirmation are required.',
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 8 characters.',
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirmation do not match.',
                });
            }

            const user = await UserManagementModel.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.',
                });
            }

            const match = await bcrypt.compare(currentPassword, user.password);

            if (!match) {
                await logAudit(req, {
                    module_name: 'Authentication',
                    action: 'PASSWORD_CHANGE_FAILED',
                    description: `${user.username} attempted to change password but provided incorrect current password.`,
                });

                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect.',
                });
            }

            await UserManagementModel.resetPassword(userId, newPassword);

            await logAudit(req, {
                module_name: 'Authentication',
                action: 'PASSWORD_CHANGED',
                description: `${user.username} changed their password.`,
            });

            return res.status(200).json({
                success: true,
                message: 'Password changed successfully.',
            });
        } catch (error) {
            console.error('CHANGE PASSWORD ERROR:', error);
            return res.status(500).json({
                success: false,
                message: 'Unable to change password.',
                error: error.message,
            });
        }
    }
}

module.exports = AuthController;
