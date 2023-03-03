const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    vendorId: {
        type: String,
        allowNull: true,
    },
    phone: {
        type: String,
        required: [true, 'Please add a Phone Number.'],
    },
    bookingTime: {
        type: String,
        required: [true, 'Please add a Time Slot'],
    },
    cityId: {
        type: String,
    },
    address: {
        type: String,
        required: [true, 'Please add a Address.'],
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'OPEN', 'PROCESSING', 'COMPLETED'],
        default: 'OPEN'
    },
    orderDate: {
        type: Date, 
        default: Date.now
    },
    statusDate: {
        type: Date
    },
    otp: {
        type: String
    },
    actionDate: {
        type: Date,
    },
}, { timestamps: true });

//we need to create collection
const Order = mongoose.model('Order', categorySchema );

module.exports = Order;