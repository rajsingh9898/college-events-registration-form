const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  tid: {
    type: String,
    required: true,
    unique: true
  },
  teamName: {
    type: String,
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  members: [{
    pid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      required: true
    },
    college: {
      type: String,
      required: true
    }
  }],
  leaderPid: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);