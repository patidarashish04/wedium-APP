const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        required: [true, 'Please add a fullName '],
        maxlength: 32,
    },
    phoneNumber: {
        type: Number,
        required: [true, 'Please add a phoneNumber '],
        maxlength: 10,
    },
    coverImage: {
        type: String,
        default: null,
    },
    profileImage: {
        type: String,
        default: null,
    },
    coverImageFullPath: {
        type: String,
        default: null,
    },
    profileImageFullPath: {
        type: String,
        default: null,
        
    },
},
);

//we need to create collection
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;