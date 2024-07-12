const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        allowNull: true,
        // required: [true, 'Please add a serviceId.'],
    },
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
    address: {
        type: String,
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'OPEN', 'PROCESSING', 'COMPLETED','CANCELED'],
        default: 'OPEN'
    },
    orderDate: {
        type: String,
        required: [true, 'Please add Booking Date'],
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
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;