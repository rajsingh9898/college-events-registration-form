const express = require('express');
const { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  deleteEvent 
} = require('../controllers/eventController');
const { adminMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin only routes (protected)
router.post('/', adminMiddleware, createEvent);
router.delete('/:id', adminMiddleware, deleteEvent);

module.exports = router;