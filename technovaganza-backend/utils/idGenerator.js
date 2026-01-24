
const User = require('../models/User');
const Team = require('../models/Team');

const generatePID = async () => {
  const latestUser = await User.findOne().sort({ createdAt: -1 });
  let sequence = 1;
  
  if (latestUser && latestUser.pid) {
    const lastSequence = parseInt(latestUser.pid.slice(7));
    sequence = lastSequence + 1;
  }
  
  return `PID2025${sequence.toString().padStart(4, '0')}`;
};

const generateTID = async () => {
  const latestTeam = await Team.findOne().sort({ createdAt: -1 });
  let sequence = 1;
  
  if (latestTeam && latestTeam.tid) {
    const lastSequence = parseInt(latestTeam.tid.slice(7));
    sequence = lastSequence + 1;
  }
  
  return `TID2025${sequence.toString().padStart(4, '0')}`;
};

module.exports = { generatePID, generateTID };
