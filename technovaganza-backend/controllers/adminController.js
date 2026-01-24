const Admin = require('../models/Admin');
const Event = require('../models/Event');
const User = require('../models/User');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 ADMIN LOGIN ATTEMPT');
    console.log('Username:', username);
    console.log('Password:', password);

    // Find admin
    const admin = await Admin.findOne({ username });
    console.log('Admin found:', admin ? 'YES' : 'NO');
    
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Stored admin data:', {
      username: admin.username,
      password: admin.password,
      passwordLength: admin.password.length
    });

    // Check password
    console.log('🔑 Checking password...');
    const isMatch = await admin.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('✅ Login successful');

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('💥 Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Create Event (Admin only) - FIXED
const createEvent = async (req, res) => {
  try {
    const { name, type, description, date, time, venue, maxParticipants, maxTeamSize, minTeamSize, amount } = req.body;

    console.log('📝 Creating event with data:', {
      name, type, description, date, time, venue, maxParticipants, maxTeamSize, minTeamSize, amount
    });

    // Enhanced validation
    if (!name || !type || !description || !date || !time || !venue || !maxParticipants) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, type, description, date, time, venue, maxParticipants'
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

    console.log('✅ Event created successfully:', event._id);
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: event
    });

  } catch (error) {
    console.error('💥 Event creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during event creation'
    });
  }
};

// Get All Events (Admin view - all events) - FIXED WITH PARTICIPANT COUNTING
const getAdminEvents = async (req, res) => {
  try {
    console.log('📊 Fetching admin events with participant counts...');
    const events = await Event.find().sort({ createdAt: -1 });
    
    // Get participant counts for each event
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        try {
          // Count users registered for this event
          const participantCount = await User.countDocuments({
            'registeredEvents.eventId': event._id
          });
          
          // Count teams registered for this event (for team events)
          const teamCount = await Team.countDocuments({
            eventId: event._id
          });
          
          // Calculate total participants
          let totalParticipants = participantCount;
          if (event.type === 'team') {
            // For team events, count team members
            const teams = await Team.find({ eventId: event._id }).populate('members');
            totalParticipants = teams.reduce((total, team) => total + team.members.length, 0);
          }
          
          console.log(`📊 Event: ${event.name}, Participants: ${totalParticipants}, Teams: ${teamCount}`);
          
          return {
            ...event.toObject(),
            registeredUsers: participantCount,
            registeredTeams: teamCount,
            totalParticipants: totalParticipants
          };
        } catch (error) {
          console.error(`❌ Error counting participants for event ${event._id}:`, error);
          return {
            ...event.toObject(),
            registeredUsers: 0,
            registeredTeams: 0,
            totalParticipants: 0
          };
        }
      })
    );
    
    console.log('✅ Admin events fetched successfully');
    res.json({
      success: true,
      events: eventsWithParticipants
    });
  } catch (error) {
    console.error('💥 Get admin events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Statistics - UPDATED WITH BETTER COUNTS
const getStatistics = async (req, res) => {
  try {
    console.log('📈 Fetching statistics...');
    
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalTeams = await Team.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const soloEvents = await Event.countDocuments({ type: 'solo' });
    const teamEvents = await Event.countDocuments({ type: 'team' });

    // Calculate total participants across all events
    let totalParticipants = 0;
    const events = await Event.find();
    for (const event of events) {
      if (event.type === 'solo') {
        const count = await User.countDocuments({ 'registeredEvents.eventId': event._id });
        totalParticipants += count;
      } else {
        const teams = await Team.find({ eventId: event._id }).populate('members');
        totalParticipants += teams.reduce((total, team) => total + team.members.length, 0);
      }
    }

    console.log('📈 Statistics calculated:', {
      totalUsers,
      totalEvents,
      totalTeams,
      activeEvents,
      soloEvents,
      teamEvents,
      totalParticipants
    });

    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalEvents,
        totalTeams,
        activeEvents,
        soloEvents,
        teamEvents,
        totalParticipants
      }
    });

  } catch (error) {
    console.error('💥 Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete Event
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

// Helper function to get event names for a user
const getUserEventNames = async (userId) => {
  try {
    const user = await User.findById(userId).populate('registeredEvents.eventId');
    if (!user || !user.registeredEvents.length) return 'No events registered';
    
    const eventNames = user.registeredEvents.map(reg => 
      reg.eventId ? reg.eventId.name : 'Unknown Event'
    );
    return eventNames.join(', ');
  } catch (error) {
    console.error('Error getting user event names:', error);
    return 'Error fetching events';
  }
};

// Helper function to get event name by ID
const getEventNameById = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return event ? event.name : 'Unknown Event';
  } catch (error) {
    console.error('Error getting event name:', error);
    return 'Unknown Event';
  }
};

// Export Event Participants - ENHANCED WITH PID AND EVENT NAMES
const exportEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { college } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let participants = [];
    
    if (event.type === 'solo') {
      // For solo events, get users registered for this event with populated events
      const users = await User.find({ 
        'registeredEvents.eventId': eventId,
        ...(college && college !== 'all' ? { college } : {})
      }).populate('registeredEvents.eventId');
      
      participants = await Promise.all(
        users.map(async (user) => {
          // Get all event names for this user
          const userEventNames = user.registeredEvents
            .map(reg => reg.eventId ? reg.eventId.name : 'Unknown Event')
            .join(', ');

          return {
            pid: user.pid, // ✅ ADDED PID
            name: user.name,
            email: user.email,
            phone: user.mobile || user.phone, // Handle both field names
            college: user.college,
            branch: user.branch,
            batch: user.batch,
            rollNumber: user.rollno || user.rollNumber, // Handle both field names
            event: event.name,
            allRegisteredEvents: userEventNames, // ✅ ADDED EVENT NAMES
            type: 'Solo'
          };
        })
      );
    } else {
      // For team events, get teams and their members
      const teams = await Team.find({ eventId }).populate('members').populate('eventId');
      
      participants = await Promise.all(
        teams.flatMap(team => 
          team.members.map(async (member) => {
            // Get all event names for this member
            const memberEventNames = await getUserEventNames(member._id);
            
            return {
              pid: member.pid, // ✅ ADDED PID
              name: member.name,
              email: member.email,
              phone: member.mobile || member.phone,
              college: member.college,
              branch: member.branch,
              batch: member.batch,
              rollNumber: member.rollno || member.rollNumber,
              event: team.eventId ? team.eventId.name : event.name,
              team: team.teamName,
              allRegisteredEvents: memberEventNames, // ✅ ADDED EVENT NAMES
              type: 'Team'
            };
          })
        )
      );

      // Filter by college if specified
      if (college && college !== 'all') {
        participants = participants.filter(participant => participant.college === college);
      }
    }

    // Convert to CSV
    const csvHeaders = Object.keys(participants[0] || {}).join(',');
    const csvRows = participants.map(p => 
      Object.values(p).map(value => `"${value}"`).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.name.replace(/\s+/g, '_')}_participants.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export event participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during export'
    });
  }
};

// Export All Participants - ENHANCED WITH PID AND EVENT NAMES
const exportAllParticipants = async (req, res) => {
  try {
    const { college } = req.query;

    // Get all users with populated events
    const users = await User.find(college && college !== 'all' ? { college } : {})
      .populate('registeredEvents.eventId');
    
    // Get all team members with populated events
    const teams = await Team.find().populate('members').populate('eventId');
    const teamMembers = await Promise.all(
      teams.flatMap(team => 
        team.members.map(async (member) => {
          const memberEventNames = await getUserEventNames(member._id);
          return {
            ...member.toObject(),
            teamName: team.teamName,
            eventId: team.eventId ? team.eventId._id : null,
            eventName: team.eventId ? team.eventId.name : 'Unknown Event',
            allRegisteredEvents: memberEventNames
          };
        })
      )
    );

    // Combine and format data
    const allParticipants = [
      // Users (solo participants)
      ...users.map(user => {
        const eventNames = user.registeredEvents
          .map(reg => reg.eventId ? reg.eventId.name : 'Unknown Event')
          .join(', ');

        return {
          pid: user.pid, // ✅ ADDED PID
          name: user.name,
          email: user.email,
          phone: user.mobile || user.phone,
          college: user.college,
          branch: user.branch,
          batch: user.batch,
          rollNumber: user.rollno || user.rollNumber,
          registeredEvents: user.registeredEvents.length,
          eventNames: eventNames, // ✅ ADDED EVENT NAMES
          type: 'Solo Participant'
        };
      }),
      // Team members
      ...teamMembers.map(member => ({
        pid: member.pid, // ✅ ADDED PID
        name: member.name,
        email: member.email,
        phone: member.mobile || member.phone,
        college: member.college,
        branch: member.branch,
        batch: member.batch,
        rollNumber: member.rollno || member.rollNumber,
        team: member.teamName,
        event: member.eventName,
        allRegisteredEvents: member.allRegisteredEvents, // ✅ ADDED EVENT NAMES
        type: 'Team Member'
      }))
    ].filter(participant => 
      !college || college === 'all' || participant.college === college
    );

    // Convert to CSV
    const csvHeaders = Object.keys(allParticipants[0] || {}).join(',');
    const csvRows = allParticipants.map(p => 
      Object.values(p).map(value => `"${value}"`).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="all_participants.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Export all participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during export'
    });
  }
};

// Export by College - ENHANCED WITH PID AND EVENT NAMES
const exportByCollege = async (req, res) => {
  try {
    const { college } = req.params;

    if (!college || college === 'all') {
      return res.status(400).json({
        success: false,
        message: 'Please specify a college name'
      });
    }

    // Get users from this college with populated events
    const users = await User.find({ college }).populate('registeredEvents.eventId');
    
    // Get team members from this college with populated events
    const teams = await Team.find().populate('members').populate('eventId');
    const teamMembers = await Promise.all(
      teams.flatMap(team => 
        team.members
          .filter(member => member.college === college)
          .map(async (member) => {
            const memberEventNames = await getUserEventNames(member._id);
            return {
              ...member.toObject(),
              teamName: team.teamName,
              eventId: team.eventId ? team.eventId._id : null,
              eventName: team.eventId ? team.eventId.name : 'Unknown Event',
              allRegisteredEvents: memberEventNames
            };
          })
      )
    );

    // Combine data
    const collegeParticipants = [
      // Users (solo participants)
      ...users.map(user => {
        const eventNames = user.registeredEvents
          .map(reg => reg.eventId ? reg.eventId.name : 'Unknown Event')
          .join(', ');

        return {
          pid: user.pid, // ✅ ADDED PID
          name: user.name,
          email: user.email,
          phone: user.mobile || user.phone,
          college: user.college,
          branch: user.branch,
          batch: user.batch,
          rollNumber: user.rollno || user.rollNumber,
          registeredEvents: user.registeredEvents.length,
          eventNames: eventNames, // ✅ ADDED EVENT NAMES
          type: 'Solo Participant'
        };
      }),
      // Team members
      ...teamMembers.map(member => ({
        pid: member.pid, // ✅ ADDED PID
        name: member.name,
        email: member.email,
        phone: member.mobile || member.phone,
        college: member.college,
        branch: member.branch,
        batch: member.batch,
        rollNumber: member.rollno || member.rollNumber,
        team: member.teamName,
        event: member.eventName,
        allRegisteredEvents: member.allRegisteredEvents, // ✅ ADDED EVENT NAMES
        type: 'Team Member'
      }))
    ];

    // Convert to CSV
    const csvHeaders = Object.keys(collegeParticipants[0] || {}).join(',');
    const csvRows = collegeParticipants.map(p => 
      Object.values(p).map(value => `"${value}"`).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${college.replace(/\s+/g, '_')}_participants.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export college error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during export'
    });
  }
};

module.exports = { 
  adminLogin, 
  createEvent, 
  getAdminEvents, 
  getStatistics,
  deleteEvent,
  exportEventParticipants,
  exportAllParticipants,
  exportByCollege
};