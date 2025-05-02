const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

const isStoreOwner = async (req, res, next) => {
    try {
        if (req.user.role !== 'store_owner' && req.user.role !== 'admin') {
            throw new Error('Access denied');
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
    }
};

module.exports = { auth, isStoreOwner }; 