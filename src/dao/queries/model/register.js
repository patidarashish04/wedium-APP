const mongoose = require('mongoose');
const { ROLES, EMAIL_PROVIDER } = require('../../../services/constants');
const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a Name'],
    maxlength: 32
  },

  // email: {
  //   type: String,
  //   required: () => {
  //     return this.provider !== 'email' ? false : true;
  //   }
  // },

  email: {
    type: String,
    required: [true, 'Please add a E-mail'],
    // match: [
    //     /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //     'Please add a valid E-mail'
    // ]
  },

  // provider: {
  //   type: String,
  //   required: true,
  //   default: EMAIL_PROVIDER.Email
  // },

  password: {
    type: String,
    trim: true,
    required: [true, 'Please add a Password'],
    minlength: [6, 'password must have at least six(6) characters'],
    // match: [
    //     /^(?=.*\d)(?=.*[@#\-_$%^&+=§!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=§!\?]+$/,
    //     'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and a special characters'
    // ]
  },
  // role: {
  //   type: String,
  //   enum: ['Member', 'Client', 'Owner', 'Admin'],
  //   default: 'Member'
  // },
  role: {
    type: String,
    default: ROLES.Member,
    enum: [ROLES.Admin, ROLES.Member, ROLES.Merchant]
  },
  token: {
    type: String
  },
  imagePath: {
    type: String,
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
const Registers = mongoose.model('register', schema);

module.exports = Registers;