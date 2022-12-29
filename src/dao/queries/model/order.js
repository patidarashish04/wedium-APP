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
        enum: ['Bhubaneswar', 'Open', 'Processing'],
        default: 'Open'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Open', 'Processing'],
        default: 'Open'
    },
    createdOn: {
        type: Date,
    },
}, { timestamps: true });

// module.exports = mongoose.model("Category", categorySchema);
//we need to create collection
const Order = mongoose.model('Order', categorySchema );

module.exports = Order;