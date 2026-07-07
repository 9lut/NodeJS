var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var User = require('../models/user.model');
require('dotenv').config();

const MY_SECRET_KEY = process.env.JWT_SECRET || "super_secret_key_that_nobody_knows"; 

// สมัครสมาชิก (Register)
router.post('/register', async function (req, res) {
    try {
        const { name, age, email, password } = req.body;
        
        // เช็คว่ามี email นี้ในระบบหรือยัง
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // เข้ารหัสผ่าน
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            age,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// เข้าสู่ระบบ (Login)
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        // ค้นหา user จาก email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
            
        // สร้าง Token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            MY_SECRET_KEY, 
            { expiresIn: '1h' }
        );

        return res.json({
            success: true,
            message: 'Login successful',
            token: token
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
