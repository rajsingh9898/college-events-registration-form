const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// User Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 [AUTH MIDDLEWARE] Starting authentication...');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔐 Token received:', token ? `YES (${token.substring(0, 20)}...)` : 'NO');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    console.log('🔐 Verifying token with JWT_SECRET...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded);
    
    // Check if it's user token
    if (decoded.userId) {
      console.log('🔐 User token detected, userId:', decoded.userId);
      req.userId = decoded.userId;
      console.log('🔐 Finding user in database...');
      req.user = await User.findById(decoded.userId).select('-password');
      req.userType = 'user';
      console.log('🔐 User found:', req.user ? `YES (${req.user.email})` : 'NO');
      
      if (!req.user) {
        console.log('❌ User not found in database for ID:', decoded.userId);
        return res.status(404).json({
          success: false,
          message: 'User not found in database'
        });
      }
    } 
    // Check if it's admin token
    else if (decoded.adminId) {
      console.log('🔐 Admin token detected, adminId:', decoded.adminId);
      req.adminId = decoded.adminId;
      console.log('🔐 Finding admin in database...');
      req.admin = await Admin.findById(decoded.adminId).select('-password');
      req.userType = 'admin';
      console.log('🔐 Admin found:', req.admin ? `YES (${req.admin.username})` : 'NO');
      
      if (!req.admin) {
        console.log('❌ Admin not found in database for ID:', decoded.adminId);
        return res.status(404).json({
          success: false,
          message: 'Admin not found in database'
        });
      }
    } else {
      console.log('❌ Invalid token structure - no userId or adminId');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    console.log('✅ Auth middleware successful, proceeding to route...');
    next();
  } catch (error) {
    console.error('💥 Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Admin Only Middleware
const adminMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 [ADMIN MIDDLEWARE] Starting admin authentication...');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ No token provided for admin route');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Admin token decoded:', decoded);
    
    if (!decoded.adminId) {
      console.log('❌ No adminId in token - admin access required');
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.adminId = decoded.adminId;
    req.admin = await Admin.findById(decoded.adminId).select('-password');
    console.log('🔐 Admin found:', req.admin ? `YES (${req.admin.username})` : 'NO');
    
    next();
  } catch (error) {
    console.error('💥 Admin middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// User Only Middleware
const userMiddleware = async (req, res, next) => {
  try {
    console.log('🔐 [USER MIDDLEWARE] Starting user authentication...');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ No token provided for user route');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 User token decoded:', decoded);
    
    if (!decoded.userId) {
      console.log('❌ No userId in token - user access required');
      return res.status(403).json({
        success: false,
        message: 'User access required'
      });
    }

    req.userId = decoded.userId;
    req.user = await User.findById(decoded.userId).select('-password');
    console.log('🔐 User found:', req.user ? `YES (${req.user.email})` : 'NO');
    
    next();
  } catch (error) {
    console.error('💥 User middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = { authMiddleware, adminMiddleware, userMiddleware };