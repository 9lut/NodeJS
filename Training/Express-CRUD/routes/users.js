var express = require('express');
var router = express.Router();
var User = require('../models/user.model');
var verifyToken = require('../midleware/auth');

// =========================================================================
// 4. PROTECTED ROUTES (ใส่ `verifyToken` เพื่อล็อกด่านไว้)
// =========================================================================

// ดึงข้อมูลผู้ใช้ทั้งหมด (ต้องมี Token)
router.get('/', verifyToken, async function (req, res, next) {
    try {
        const users = await User.find().select('-password'); // ไม่ดึงฟิลด์รหัสผ่านออกมา
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ดึงข้อมูลผู้ใช้ตาม ID (ต้องมี Token)
router.get('/:id', verifyToken, async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// เพิ่มผู้ใช้ใหม่ (ต้องมี Token) - การสร้าง User ใหม่ควรเช็คการแฮชรหัสผ่านเหมือน Register (ถ้าใช้ API นี้สร้าง)
// แต่ในที่นี้จะอนุญาตให้สร้างได้เพื่อความครบถ้วนของ CRUD
router.post('/', verifyToken, async function (req, res, next) {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// แก้ไขผู้ใช้ (ต้องมี Token)
router.put('/:id', verifyToken, async function (req, res, next) {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ลบผู้ใช้ (ต้องมี Token)
router.delete('/:id', verifyToken, async function (req, res, next) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: `User deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/profile', verifyToken, async function(req, res) {
    try {
        // ดึงข้อมูลโปรไฟล์ของคนที่ล็อกอินอยู่โดยใช้ id จาก token (req.user.id)
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: user, msg: `สวัสดี ${user.name}` });
    } catch (error) {
         res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;