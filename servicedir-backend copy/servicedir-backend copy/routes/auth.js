const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

// REGISTER ROUTE: POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log("📝 Register attempt received for:", req.body.email);
  console.log("📝 Request body:", JSON.stringify(req.body));

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
      "YOUR_SECRET_KEY",
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
    res.status(500).json({ message: err.message });
  }
});

// LOGIN ROUTE: POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log("🔔 Login attempt received for:", req.body.email);

  const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Login failed: User not found in database");
      
      // Log failed login attempt
      await LoginHistory.create({
        email: email.toLowerCase(),
        role: 'unknown',
        status: 'failed',
        reason: 'User not found',
        ipAddress,
        userAgent,
        isAdmin: false
      });

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Login failed: Password did not match");
      
      // Log failed login attempt
      await LoginHistory.create({
        userId: user._id,
        email: user.email,
        role: user.role,
        status: 'failed',
        reason: 'Invalid password',
        ipAddress,
        userAgent,
        isAdmin: user.role === 'admin'
      });

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Create Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "YOUR_SECRET_KEY", 
      { expiresIn: '1d' }
    );

    // 4. Log successful login to database
    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      status: 'success',
      ipAddress,
      userAgent,
      isAdmin: user.role === 'admin'
    });

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
    res.status(500).json({ message: err.message });
  }
});

// GET ALL USERS - For admin dashboard
router.get('/users/all', async (req, res) => {
  try {
    console.log("📋 Fetching all registered users...");
    
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    const usersByRole = {
      customers: users.filter(u => u.role === 'customer'),
      businessOwners: users.filter(u => u.role === 'business'),
      admins: users.filter(u => u.role === 'admin'),
      total: users.length
    };

    console.log(`✅ Retrieved ${users.length} users`);
    res.json(usersByRole);

  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET LOGIN HISTORY - For admin dashboard
router.get('/login-history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const status = req.query.status;

    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (status) {
      query.status = status;
    }

    const history = await LoginHistory.find(query)
      .populate('userId', 'name email')
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginHistory.countDocuments(query);

    // Get summary statistics
    const successLogins = await LoginHistory.countDocuments({ status: 'success' });
    const failedLogins = await LoginHistory.countDocuments({ status: 'failed' });
    const adminLogins = await LoginHistory.countDocuments({ isAdmin: true });

    console.log(`📋 Retrieved ${history.length} login records`);

    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: {
        totalAttempts: successLogins + failedLogins,
        successLogins,
        failedLogins,
        adminLogins
      }
    });

  } catch (err) {
    console.error("❌ Error fetching login history:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET LOGIN HISTORY STATS - For admin dashboard
router.get('/login-stats', async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      last24Hours: {
        total: await LoginHistory.countDocuments({ loginTime: { $gte: last24Hours } }),
        success: await LoginHistory.countDocuments({ loginTime: { $gte: last24Hours }, status: 'success' }),
        failed: await LoginHistory.countDocuments({ loginTime: { $gte: last24Hours }, status: 'failed' })
      },
      last7Days: {
        total: await LoginHistory.countDocuments({ loginTime: { $gte: last7Days } }),
        success: await LoginHistory.countDocuments({ loginTime: { $gte: last7Days }, status: 'success' }),
        failed: await LoginHistory.countDocuments({ loginTime: { $gte: last7Days }, status: 'failed' })
      },
      last30Days: {
        total: await LoginHistory.countDocuments({ loginTime: { $gte: last30Days } }),
        success: await LoginHistory.countDocuments({ loginTime: { $gte: last30Days }, status: 'success' }),
        failed: await LoginHistory.countDocuments({ loginTime: { $gte: last30Days }, status: 'failed' })
      },
      byRole: {
        customer: await LoginHistory.countDocuments({ role: 'customer', status: 'success' }),
        business: await LoginHistory.countDocuments({ role: 'business', status: 'success' }),
        admin: await LoginHistory.countDocuments({ role: 'admin', status: 'success' })
      }
    };

    console.log('📊 Login statistics retrieved');
    res.json(stats);

  } catch (err) {
    console.error("❌ Error fetching login stats:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;