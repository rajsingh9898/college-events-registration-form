const User = require('../models/User');
const Event = require('../models/Event');

// Get User Dashboard
const getUserDashboard = async (req, res) => {
  try {
    console.log('📊 [DASHBOARD] Starting dashboard request...');
    console.log('📊 req.userId:', req.userId);
    console.log('📊 req.userType:', req.userType);
    console.log('📊 req.user:', req.user ? `Present (${req.user.email})` : 'Not present');

    if (!req.userId) {
      console.log('❌ No userId in request - authentication failed');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('📊 Finding user in database with ID:', req.userId);
    const user = await User.findById(req.userId).populate('registeredEvents.eventId');

    console.log('📊 User found in DB:', user ? `YES (${user.email})` : 'NO');
    
    if (!user) {
      console.log('❌ User not found in database for ID:', req.userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('📊 Registered events count:', user.registeredEvents.length);
    if (user.registeredEvents.length > 0) {
      console.log('📊 First registered event:', user.registeredEvents[0]);
    }

    console.log('📊 Finding active events...');
    const events = await Event.find({ isActive: true });
    console.log('📊 Active events found:', events.length);

    console.log('✅ Dashboard data fetched successfully');
    res.json({
      success: true,
      user: {
        pid: user.pid,
        name: user.name,
        email: user.email,
        rollno: user.rollno,
        college: user.college,
        branch: user.branch,
        batch: user.batch,
        registeredEvents: user.registeredEvents,
        eventsCount: user.registeredEvents.length
      },
      events: events
    });

  } catch (error) {
    console.error('💥 Dashboard error:', error);
    
    // More specific error handling
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard'
    });
  }
};

// Register for Solo Event
const registerForSoloEvent = async (req, res) => {
  try {
    console.log('🎯 [SOLO REGISTRATION] Starting registration...');
    const { eventId } = req.body;
    const userId = req.userId;

    console.log('🎯 Event ID:', eventId);
    console.log('🎯 User ID:', userId);

    if (!eventId) {
      console.log('❌ No eventId provided');
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Check event limit (max 3)
    const user = await User.findById(userId);
    console.log('🎯 Current user events:', user.registeredEvents.length);
    
    if (user.registeredEvents.length >= 3) {
      console.log('❌ User already registered for 3 events');
      return res.status(400).json({
        success: false,
        message: 'You have already registered for maximum 3 events'
      });
    }

    // Check if already registered for this EXACT event
    const alreadyRegistered = user.registeredEvents.some(
      event => event.eventId.toString() === eventId
    );

    if (alreadyRegistered) {
      console.log('❌ User already registered for this event');
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check event capacity and existence
    console.log('🎯 Finding event:', eventId);
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('❌ Event not found:', eventId);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('🎯 Event found:', event.name);
    console.log('🎯 Current participants:', event.currentParticipants, '/', event.maxParticipants);

    if (event.currentParticipants >= event.maxParticipants) {
      console.log('❌ Event is full');
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Register for event
    console.log('🎯 Registering user for event...');
    user.registeredEvents.push({
      eventId: eventId,
      eventType: 'solo',
      registrationDate: new Date()
    });

    await user.save();

    // Update event participants count
    event.currentParticipants += 1;
    await event.save();

    // Get updated user with event details
    const updatedUser = await User.findById(userId).populate('registeredEvents.eventId');

    console.log('✅ Successfully registered for event');
    res.json({
      success: true,
      message: 'Successfully registered for solo event',
      registeredEvents: updatedUser.registeredEvents
    });

  } catch (error) {
    console.error('💥 Solo registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

module.exports = { getUserDashboard, registerForSoloEvent };