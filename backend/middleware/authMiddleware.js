const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fleet_default_jwt_secret_dev_key_2026';
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  [WARN] JWT_SECRET is not set in .env! Using default fallback secret for development.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

function signAccessToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
            role_id: user.role_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyToken(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            role_id: decoded.role_id,
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired session. Please log in again.',
        });
    }
}

module.exports = { signAccessToken, verifyToken };
