const Event = require('../models/Event');
const User = require('../models/User');
const Team = require('../models/Team');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [events, users, teams] = await Promise.all([
      Event.find(),
      User.find(),
      Team.find()
    ]);

    // Calculate statistics
    const totalEvents = events.length;
    const totalUsers = users.length;
    const totalTeams = teams.length;
    
    const activeEvents = events.filter(event => 
      event.isActive && new Date(event.date) >= new Date()
    ).length;
    
    const upcomingEvents = events.filter(event => 
      new Date(event.date) >= new Date()
    ).length;

    const totalRegistrations = users.reduce((sum, user) => 
      sum + (user.registeredEvents ? user.registeredEvents.length : 0), 0
    );
    
    const usersWithRegistrations = users.filter(user => 
      user.registeredEvents && user.registeredEvents.length > 0
    ).length;

    const totalRevenue = events.reduce((sum, event) => {
      return sum + (event.amount * event.currentParticipants);
    }, 0);

    // College statistics
    const collegeStats = {};
    users.forEach(user => {
      if (!collegeStats[user.college]) {
        collegeStats[user.college] = 0;
      }
      collegeStats[user.college]++;
    });

    // Event statistics
    const eventStats = events.map(event => ({
      _id: event._id,
      name: event.name,
      participants: event.currentParticipants,
      maxParticipants: event.maxParticipants,
      participationRate: event.maxParticipants > 0 ? 
        Math.round((event.currentParticipants / event.maxParticipants) * 100) : 0,
      date: event.date,
      type: event.type,
      revenue: event.amount * event.currentParticipants
    }));

    // Popular events
    const popularEvents = [...eventStats]
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5);

    // Event type distribution
    const soloEvents = events.filter(event => event.type === 'solo').length;
    const teamEvents = events.filter(event => event.type === 'team').length;

    // Team statistics
    const teamStats = {};
    teams.forEach(team => {
      const eventId = team.eventId.toString();
      if (!teamStats[eventId]) {
        teamStats[eventId] = 0;
      }
      teamStats[eventId]++;
    });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = users.filter(user => 
      new Date(user.createdAt) >= sevenDaysAgo
    ).length;

    res.json({
      overview: {
        totalEvents,
        totalUsers,
        totalTeams,
        activeEvents,
        upcomingEvents,
        usersWithRegistrations,
        totalRegistrations,
        recentRegistrations,
        totalRevenue
      },
      events: {
        popularEvents,
        eventStats,
        typeDistribution: {
          solo: soloEvents,
          team: teamEvents
        },
        averageParticipation: eventStats.length > 0 ? 
          Math.round(eventStats.reduce((sum, event) => sum + event.participationRate, 0) / eventStats.length) : 0
      },
      teams: {
        teamStats,
        totalTeams
      },
      colleges: {
        collegeStats,
        totalColleges: Object.keys(collegeStats).length
      },
      trends: {
        registrationRate: totalUsers > 0 ? Math.round((recentRegistrations / totalUsers) * 100) : 0,
        eventFillRate: eventStats.length > 0 ? 
          Math.round(eventStats.reduce((sum, event) => sum + event.participationRate, 0) / eventStats.length) : 0
      }
    });

  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
};

// Get all events for dropdown
const getEventsList = async (req, res) => {
  try {
    const events = await Event.find().select('name _id date type currentParticipants');
    
    const eventList = events.map(event => ({
      _id: event._id,
      name: event.name,
      date: event.date,
      type: event.type,
      participants: event.currentParticipants
    }));

    res.json(eventList);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get unique colleges for filter dropdown
const getColleges = async (req, res) => {
  try {
    const colleges = await User.distinct('college');
    res.json(colleges.sort());
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

// Export participants for a specific event as CSV
const exportEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { college } = req.query;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Build query with college filter
    let userQuery = {
      'registeredEvents.eventId': eventId
    };

    // If college filter is provided
    if (college && college !== 'all') {
      userQuery.college = new RegExp(college, 'i');
    }

    // Find users with college filter
    const users = await User.find(userQuery);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No participants found for this event' });
    }

    // Prepare CSV data with college column
    const csvHeaders = [
      'PID', 'Name', 'Roll No', 'Email', 'Mobile', 'College', 'Branch', 'Batch',
      'Registration Type', 'Team ID', 'Team Name', 'Registration Date'
    ].join(',');

    const csvRows = users.map(user => {
      const registration = user.registeredEvents.find(reg => 
        reg.eventId.toString() === eventId
      );

      let teamName = 'Individual';
      let teamId = '';

      if (registration && registration.teamId) {
        teamName = `Team_${registration.teamId}`;
        teamId = registration.teamId;
      }

      const registrationType = registration?.eventType || 'solo';

      return [
        `"${user.pid}"`,
        `"${user.name}"`,
        `"${user.rollno}"`,
        `"${user.email}"`,
        `"${user.mobile}"`,
        `"${user.college}"`, // ADD COLLEGE DATA
        `"${user.branch}"`,
        `"${user.batch}"`,
        `"${registrationType}"`,
        `"${teamId}"`,
        `"${teamName}"`,
        `"${registration?.registrationDate || user.createdAt}"`
      ].join(',');
    });

    const csvData = [csvHeaders, ...csvRows].join('\n');

    // Set filename with college info if filtered
    let filename = `${event.name.replace(/[^a-z0-9]/gi, '_')}_participants.csv`;
    if (college && college !== 'all') {
      filename = `${event.name.replace(/[^a-z0-9]/gi, '_')}_${college.replace(/[^a-z0-9]/gi, '_')}_participants.csv`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvData);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

// Export all participants
const exportAllParticipants = async (req, res) => {
  try {
    const { college } = req.query;
    
    const events = await Event.find();
    
    // Build user query with college filter
    let userQuery = {};
    if (college && college !== 'all') {
      userQuery.college = new RegExp(college, 'i');
    }
    
    const users = await User.find(userQuery);

    const csvHeaders = [
      'Event Name', 'Event Type', 'Event Date', 'PID', 'Participant Name', 
      'Roll No', 'Email', 'Mobile', 'College', 'Branch', 'Batch', 'Registration Date'
    ].join(',');

    const csvRows = [];

    users.forEach(user => {
      user.registeredEvents.forEach(registration => {
        const event = events.find(e => e._id.toString() === registration.eventId.toString());
        
        if (event) {
          csvRows.push([
            `"${event.name}"`,
            `"${event.type}"`,
            `"${event.date}"`,
            `"${user.pid}"`,
            `"${user.name}"`,
            `"${user.rollno}"`,
            `"${user.email}"`,
            `"${user.mobile}"`,
            `"${user.college}"`, // ADD COLLEGE DATA
            `"${user.branch}"`,
            `"${user.batch}"`,
            `"${registration.registrationDate}"`
          ].join(','));
        }
      });
    });

    const csvData = [csvHeaders, ...csvRows].join('\n');

    // Set filename with college info if filtered
    let filename = "all_participants.csv";
    if (college && college !== 'all') {
      filename = `all_${college.replace(/[^a-z0-9]/gi, '_')}_participants.csv`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(csvData);

  } catch (error) {
    console.error('All participants export error:', error);
    res.status(500).json({ error: 'Failed to export all participants' });
  }
};

module.exports = {
  getDashboardStats,
  getEventsList,
  getColleges,
  exportEventParticipants,
  exportAllParticipants
};