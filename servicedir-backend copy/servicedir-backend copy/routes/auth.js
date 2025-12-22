const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER ROUTE: POST /api/auth/register
router.post('/register', async (req, res) => {
  // LOG: Check if request reaches here
  console.log("📝 Register attempt received for:", req.body.email);

  try {
    const { name, email, password, role, businessName, businessCategory } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Registration failed: User already exists");
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password (Encrypt it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create new User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      businessName,
      businessCategory
    });

    const savedUser = await newUser.save();
    console.log("✅ User registered successfully:", savedUser.email);

    // 4. Create a Token (Log them in immediately)
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role }, 
      "YOUR_SECRET_KEY", // Note: In production, use process.env.JWT_SECRET
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (err) {
    console.error("💥 Register Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// LOGIN ROUTE: POST /api/auth/login
router.post('/login', async (req, res) => {
  // LOG: Check if request reaches here
  console.log("🔔 Login attempt received for:", req.body.email);

  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Login failed: User not found in database");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Login failed: Password did not match");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Create Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "YOUR_SECRET_KEY", 
      { expiresIn: '1d' }
    );

    console.log("✅ Login successful, sending token");
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("💥 Server Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;