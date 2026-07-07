const express = require('express');
const router = express.Router();
const User = require('../models/User.Model.js');

const { authenticateToken, isAdmin } = require('../middleware/auth');

/* GET users listing. */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            status: 200,
            message: "success",
            data: users
        });
    } catch (error) {
        console.error("Approve Error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: []
        });
    }
});

// [PUT] /api/v1/users/:id/approve
router.put('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isApproved: true },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({
                status: 400,
                message: "User not found",
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: "success",
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                isApproved: updatedUser.isApproved
            }
        });
    } catch (error) {
        console.error("Approve Error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            data: null
        });
    }
});

module.exports = router;
