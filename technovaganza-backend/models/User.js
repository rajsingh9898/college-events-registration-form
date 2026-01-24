const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rollno: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Only allow numbers
        return /^\d+$/.test(v);
      },
      message: 'Roll number must contain only numbers'
    },
    minlength: [3, 'Roll number must be at least 3 digits'],
    maxlength: [15, 'Roll number cannot exceed 15 digits']
  },
  mobile: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true,
    default: 'SRMS CET & R'
  },
  branch: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  registeredEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    eventType: {
      type: String,
      enum: ['solo', 'team']
    },
    teamId: {
      type: String
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);