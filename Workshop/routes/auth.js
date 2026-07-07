const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.Model");

// rate limiters
const rateLimit = require("express-rate-limit");
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 login requests per windowMs
    message: {
        status: 429,
        message: "Too many login attempts. Please try again later.",
        data: null,
    },
})

// [POST] /api/v1/register
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "Username already exists",
        data: null,
      });
    }

    // Determine approval status based on role
    let isApproved = true;
    if (role === "shop") {
      isApproved = false;
    }

    const newUser = new User({
      username,
      password,
      role: role || "user",
      isApproved,
    });

    await newUser.save();

    res.status(201).json({
      status: 201,
      message: "success",
      data: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        isApproved: newUser.isApproved,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

// [POST] /api/v1/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "email or password is incorrect",
        data: null,
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "email or password is incorrect",
        data: null,
      });
    }

    // Check if approved
    if (!user.isApproved) {
      return res.status(401).json({
        status: 401,
        message: "Account pending admin approval",
        data: null,
      });
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      status: 200,
      message: "success",
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

module.exports = router;
