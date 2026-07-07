var jwt = require('jsonwebtoken');
require('dotenv').config();

const MY_SECRET_KEY = process.env.JWT_SECRET || "super_secret_key_that_nobody_knows"; 

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, MY_SECRET_KEY);
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
    }
}

module.exports = verifyToken;
