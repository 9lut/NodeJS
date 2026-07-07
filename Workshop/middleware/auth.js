const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Access Denied: No Token Provided!",
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey123');
        req.user = decoded; // Contains id and role
        next();
    } catch (error) {
        return res.status(403).json({
            status: 403,
            message: "Invalid Token",
            data: null
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            status: 403,
            message: "Access Denied: Admin role required",
            data: null
        });
    }
};

const isShopOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'shop')) {
        next();
    } else {
        return res.status(403).json({
            status: 403,
            message: "Access Denied: Shop or Admin role required",
            data: null
        });
    }
};

module.exports = { authenticateToken, isAdmin, isShopOrAdmin };
