const User = require('../models/User');
const { generatePID } = require('../utils/idGenerator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, rollno, mobile, batch, branch, email, password, college } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollno }] 
    });

    if (rollno.length < 3 || rollno.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Roll number must be between 3 and 15 digits'
      });
    }
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or roll number'
      });
    }

    // Generate PID
    const pid = await generatePID();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      pid,
      name,
      rollno,
      mobile,
      batch,
      branch,
      email,
      password: hashedPassword,
      college: college || 'SRMS CET & R' // Updated default college
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, pid: user.pid }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        pid: user.pid,
        name: user.name,
        email: user.email,
        rollno: user.rollno,
        college: user.college
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, pid: user.pid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        pid: user.pid,
        name: user.name,
        email: user.email,
        rollno: user.rollno,
        college: user.college,
        registeredEvents: user.registeredEvents
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = { registerUser, loginUser };