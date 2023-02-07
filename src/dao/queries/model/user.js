const mongoose = require('mongoose');

const schemas = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER",
    },
    phoneOtp: String
},
    { timestamps: true }
);

//we need to create collection
const User = mongoose.model('user', schemas);

module.exports = User;