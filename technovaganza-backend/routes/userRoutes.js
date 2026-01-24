const express = require('express');
const { getUserDashboard, registerForSoloEvent } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', authMiddleware, getUserDashboard);
router.post('/register-solo', authMiddleware, registerForSoloEvent);

module.exports = router;