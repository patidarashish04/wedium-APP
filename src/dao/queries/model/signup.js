const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a Name'],
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
  password: {
    type: String,
    trim: true,
    required: [true, 'Please add a Password'],
    minlength: [6, 'password must have at least six(6) characters'],
  },
  role: {
    type: String,
    enum: ['Admin', 'Member', 'Merchant'],
    default: 'Member',
  },
  token: {
    type: String
  },
  imagePath: {
    type: String,
    default: null,
  },
  lastActive: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

//we need to create collection
const Signup = mongoose.model('signup', schema);

module.exports = Signup;