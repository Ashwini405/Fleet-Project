const pool = require("../config/db");

class AuthModel {

    // ==========================================================
    // Get User By Username Or Email
    // ==========================================================

    static async getUserByUsername(username) {

        const [rows] = await pool.query(`
            SELECT *
            FROM users
            WHERE (username = ? OR email = ?)
            AND is_deleted = 0
        `, [username, username]);

        return rows.length ? rows[0] : null;

    }

    // ==========================================================
    // Login Attempt Tracking
    // ==========================================================

    static async incrementFailedAttempts(userId) {

        await pool.query(`
            UPDATE users
            SET failed_login_attempts = failed_login_attempts + 1
            WHERE id = ?
        `, [userId]);

        const [rows] = await pool.query(`
            SELECT failed_login_attempts FROM users WHERE id = ?
        `, [userId]);

        return rows[0]?.failed_login_attempts || 0;

    }

    static async resetFailedAttempts(userId) {

        await pool.query(`
            UPDATE users
            SET failed_login_attempts = 0, locked_until = NULL
            WHERE id = ?
        `, [userId]);

    }

    static async lockUser(userId, minutes = 30) {

        await pool.query(`
            UPDATE users
            SET status = 'Locked', locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE)
            WHERE id = ?
        `, [minutes, userId]);

    }

    static async updateLastLogin(userId) {

        await pool.query(`
            UPDATE users
            SET last_login = NOW()
            WHERE id = ?
        `, [userId]);

    }

    // ==========================================================
    // Refresh Tokens
    // ==========================================================

    static async createRefreshToken({ userId, tokenHash, expiresAt, ip, userAgent }) {

        const [result] = await pool.query(`
            INSERT INTO refresh_tokens
            (user_id, token_hash, expires_at, created_by_ip, user_agent)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, tokenHash, expiresAt, ip || null, userAgent || null]);

        return result.insertId;

    }

    static async findRefreshTokenByHash(tokenHash) {

        const [rows] = await pool.query(`
            SELECT *
            FROM refresh_tokens
            WHERE token_hash = ?
            AND revoked_at IS NULL
            AND expires_at > NOW()
        `, [tokenHash]);

        return rows.length ? rows[0] : null;

    }

    static async revokeRefreshToken(id) {

        await pool.query(`
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = ?
        `, [id]);

    }

    // ==========================================================
    // Login History
    // ==========================================================

    static async createLoginHistory({ userId, ip, browser, loginType = 'Web', status, remarks = null }) {

        await pool.query(`
            INSERT INTO user_login_history
            (user_id, login_time, ip_address, browser, login_type, status, remarks)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `, [userId, ip || null, browser || null, loginType, status, remarks]);

    }

    static async getLoginHistory(userId, limit = 50) {

        const [rows] = await pool.query(`
            SELECT id, login_time, ip_address, browser, login_type, status, remarks
            FROM user_login_history
            WHERE user_id = ?
            ORDER BY login_time DESC
            LIMIT ?
        `, [userId, limit]);

        return rows;

    }

    // ==========================================================
    // My Account (Self-Service)
    // ==========================================================

    static async updateOwnProfile(userId, { employee_name, email, phone }) {

        await pool.query(`
            UPDATE users
            SET employee_name = ?, email = ?, phone = ?, updated_by = username
            WHERE id = ?
        `, [employee_name, email, phone || null, userId]);

    }

    static async updateOwnPassword(userId, hashedPassword) {

        await pool.query(`
            UPDATE users
            SET password = ?, force_password_reset = 0
            WHERE id = ?
        `, [hashedPassword, userId]);

    }

    static async getActiveSessions(userId) {

        const [rows] = await pool.query(`
            SELECT id, token_hash, created_by_ip, user_agent, created_at, expires_at
            FROM refresh_tokens
            WHERE user_id = ?
            AND revoked_at IS NULL
            AND expires_at > NOW()
            ORDER BY created_at DESC
        `, [userId]);

        return rows;

    }

    static async revokeUserSession(sessionId, userId) {

        const [result] = await pool.query(`
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = ? AND user_id = ? AND revoked_at IS NULL
        `, [sessionId, userId]);

        return result.affectedRows;

    }

}

module.exports = AuthModel;
