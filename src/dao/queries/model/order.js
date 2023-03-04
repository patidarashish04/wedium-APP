const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    vendorId: {
        type: String,
        allowNull: true,
    },
    // serviceId: {
    //     type: String,
    //     required: [true, 'Please add a serviceId.'],
    // },
    ServiceData: {
        type: Object,
    },
    cityData: {
        type: Object,
    },
    vendorData: {
        type: Object,
    },
    name: {
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
    // cityId: {
    //     type: String,
    //     required: [true, 'Please add a cityId.'],
    // },
    address: {
        type: String,
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
const Order = mongoose.model('Order', orderSchema );

module.exports = Order;