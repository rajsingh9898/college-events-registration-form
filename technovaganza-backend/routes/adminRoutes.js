const express = require('express');
const { 
  adminLogin, 
  createEvent, 
  getAdminEvents, 
  getStatistics,
  deleteEvent,
  exportEventParticipants,
  exportAllParticipants,
  exportByCollege
} = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Admin auth (public)
router.post('/login', adminLogin);

// Admin protected routes
router.post('/events', adminMiddleware, createEvent);
router.get('/events', adminMiddleware, getAdminEvents);
router.get('/statistics', adminMiddleware, getStatistics);
router.delete('/events/:id', adminMiddleware, deleteEvent);

// Export routes
router.get('/export/event/:eventId', adminMiddleware, exportEventParticipants);
router.get('/export/all-participants', adminMiddleware, exportAllParticipants);
router.get('/export/college/:college', adminMiddleware, exportByCollege);

module.exports = router;