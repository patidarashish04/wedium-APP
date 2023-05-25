const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true 
},
  message: { 
    type: String, 
    required: true }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
