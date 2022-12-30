const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: [true, 'Please add a userName '],
        maxlength: 32,
    },
    serviceName: {
        type: String,
        required: [true, 'Please add a serviceName '],
    },
    cityName: {
        type: String,
        enum: ['Bhubaneswar', 'Bhopal', 'Bangalore'],
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