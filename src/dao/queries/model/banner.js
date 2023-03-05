const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    imagePath: {
        type: [String], default: [],
        required: [true, 'Please add a image'],
        default: null,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'INACTIVE'
    },
}, { timestamps: true });

//we need to create collection
const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;