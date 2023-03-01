const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    vendorId: {
        type: String,
        required: [true, 'VendorId not found'],
    },
    phone: {
        type: String,
        required: [true, 'Please add a Phone Number.'],
    },
    time: {
        type: String,
        required: [true, 'Please add a Time Slot'],
    },
    cityId: {
        type: String,
    },
    address: {  
        type: String
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'OPEN', 'PROCESSING'],
        default: 'OPEN'
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