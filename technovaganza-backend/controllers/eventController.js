const Event = require('../models/Event');

// Get All Active Events (Public - no auth required)
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true });
    
    res.json({
      success: true,
      events: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Event by ID (Public - no auth required)
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const { 
      name, type, description, date, time, venue, amount, 
      maxParticipants, maxTeamSize, minTeamSize 
    } = req.body;

    // Validation
    if (!name || !type || !description || !date || !time || !venue || !maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    if (type === 'team' && (!maxTeamSize || !minTeamSize)) {
      return res.status(400).json({
        success: false,
        message: 'Team size requirements must be specified for team events'
      });
    }

    if (type === 'team' && minTeamSize > maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: 'Minimum team size cannot be greater than maximum team size'
      });
    }

    const event = new Event({
      name,
      type,
      description,
      date,
      time,
      venue,
      amount: amount || 0,
      maxParticipants,
      maxTeamSize: type === 'team' ? maxTeamSize : 1,
      minTeamSize: type === 'team' ? minTeamSize : 1,
      createdBy: req.adminId
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: event
    });

  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during event creation'
    });
  }
};

// Delete Event (Admin only - protected)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  deleteEvent 
};