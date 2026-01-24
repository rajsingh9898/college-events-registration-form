const Team = require('../models/Team');
const User = require('../models/User');
const Event = require('../models/Event');
const { generateTID } = require('../utils/idGenerator');

// Create Team
const createTeam = async (req, res) => {
  try {
    const { eventId, teamName, members } = req.body;
    const leaderPid = req.user.pid;

    // Check if leader exists
    const leader = await User.findOne({ pid: leaderPid });
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }

    // Check event limit for leader
    if (leader.registeredEvents.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for maximum 3 events'
      });
    }

    // Check if leader already registered for this event
    const leaderAlreadyRegistered = leader.registeredEvents.some(
      event => event.eventId.toString() === eventId
    );

    if (leaderAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.type !== 'team') {
      return res.status(400).json({
        success: false,
        message: 'This is not a team event'
      });
    }

    // Validate team size
    const totalMembers = members.length + 1; // +1 for leader
    if (totalMembers > event.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Team size cannot exceed ${event.maxTeamSize} members`
      });
    }

    if (totalMembers < event.minTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Team must have at least ${event.minTeamSize} members`
      });
    }

    // Validate all members
    const validatedMembers = [];
    for (const memberPid of members) {
      // Skip empty PIDs
      if (!memberPid.trim()) continue;

      const member = await User.findOne({ pid: memberPid });
      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Member with PID ${memberPid} not found`
        });
      }

      // Check event limit for each member
      if (member.registeredEvents.length >= 3) {
        return res.status(400).json({
          success: false,
          message: `Member ${member.name} has already registered for maximum 3 events`
        });
      }

      // Check if member already registered for this event
      const memberAlreadyRegistered = member.registeredEvents.some(
        event => event.eventId.toString() === eventId
      );

      if (memberAlreadyRegistered) {
        return res.status(400).json({
          success: false,
          message: `Member ${member.name} is already registered for this event`
        });
      }

      validatedMembers.push({
        pid: member.pid,
        name: member.name,
        branch: member.branch,
        college: member.college // ADD COLLEGE INFO
      });
    }

    // Add leader to members
    const allMembers = [
      {
        pid: leader.pid,
        name: leader.name,
        branch: leader.branch,
        college: leader.college // ADD COLLEGE INFO
      },
      ...validatedMembers
    ];

    // Generate TID
    const tid = await generateTID();

    // Create team
    const team = new Team({
      tid,
      teamName,
      eventId,
      members: allMembers,
      leaderPid
    });

    await team.save();

    // Register all members for the event
    for (const member of allMembers) {
      await User.findOneAndUpdate(
        { pid: member.pid },
        {
          $push: {
            registeredEvents: {
              eventId: eventId,
              eventType: 'team',
              teamId: tid,
              registrationDate: new Date()
            }
          }
        }
      );
    }

    // Update event participants count
    event.currentParticipants += allMembers.length;
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: {
        tid: team.tid,
        teamName: team.teamName,
        members: team.members
      }
    });

  } catch (error) {
    console.error('Team creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during team creation'
    });
  }
};

// Validate Team Member
const validateTeamMember = async (req, res) => {
  try {
    const { pid } = req.body;

    const member = await User.findOne({ pid });
    if (!member) {
      return res.json({
        valid: false,
        message: 'PID not found'
      });
    }

    // Check event limit
    if (member.registeredEvents.length >= 3) {
      return res.json({
        valid: false,
        message: 'Member has already registered for maximum 3 events'
      });
    }

    res.json({
      valid: true,
      member: {
        pid: member.pid,
        name: member.name,
        branch: member.branch,
        college: member.college, // ADD COLLEGE INFO
        eventsCount: member.registeredEvents.length
      }
    });

  } catch (error) {
    console.error('Member validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { createTeam, validateTeamMember };