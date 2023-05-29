const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120 // TTL set to 2 minutes (in seconds)
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;