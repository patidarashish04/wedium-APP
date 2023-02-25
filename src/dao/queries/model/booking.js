const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    service: {
        type: String,
        trim: true,
        required: [true, 'Please add a fullName '],
        maxlength: 32,
    },
    date: {
        type: Number,
        required: [true, 'Please add a phoneNumber '],
        maxlength: 10,
    },
    timeSlot: {
        type: String,
        default: null,
    },
    CityId: {
        type: String,
        default: null,
    }
},
);

//we need to create collection
const Booking = mongoose.model('booking', bookingSchema);

module.exports = Booking;