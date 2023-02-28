const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    vendorId: {
        type: String,
        required: [true, 'Please add a time slot'],
    },
    phoneNo: {
        type: String,
        required: [true, 'Please add a phonenumber.'],
    },
    time: {
        type: String,
        required: [true, 'Please add a vendorId'],
    },
    cityId: {
        type: String,
        default: 'Bhubaneswar'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Open', 'Processing'],
        default: 'Open'
    },
    orderDate: {
        type: Date, 
        default: Date.now
    },
    createdOn: {
        type: Date, 
        default: Date.now
    },
}, { timestamps: true });

//we need to create collection
const Order = mongoose.model('Order', categorySchema );

module.exports = Order;