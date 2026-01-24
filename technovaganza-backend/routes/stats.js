const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getEventsList,
  getColleges,
  exportEventParticipants,
  exportAllParticipants
} = require('../controllers/statsController');

// CORRECTED IMPORT - use the actual exported function names
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Apply auth middleware to all stats routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get events list for dropdown
router.get('/events', getEventsList);

// Get colleges list for filter
router.get('/colleges', getColleges);

// Export routes
router.get('/export/event/:eventId', exportEventParticipants);
router.get('/export/all-participants', exportAllParticipants);

module.exports = router;