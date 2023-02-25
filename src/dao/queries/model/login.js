const mongoose = require('mongoose');

const schemas = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: Number,
        default: 0,
    },
    token: {
        type: String
    },
});

//we need to create collection
const Login = mongoose.model('login', schemas);

module.exports = Login;