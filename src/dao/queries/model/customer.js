const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    required: [true, 'Please add a Full-Name'],
    maxlength: 32
  },
  email: {
    type: String,
    required: [true, 'Please add a E-mail'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a Phone No.'],
  },
});

//we need to create collection
const Customer = mongoose.model('customer', customerSchema);

module.exports = Customer;