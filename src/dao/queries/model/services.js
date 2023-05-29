const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    subCatgoryData: {
        type: Object,
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a service_name'],
        unique:true,
    },
    image: {
        type: [String], default: [],
        required: [true, 'Please add a image'],
        default: null,
    },
    absoluteServicePath: {
        type: String,
        default: null,
    },
    descriptions: {
        type: String,
        default: null,
    },
    note: {
        type: String,
        default: null,
    },
    price: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'INACTIVE'
    },
    isBestSeller: {
        type: Boolean,
        default: false,
    },
    noOfOrders: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Services = mongoose.model('Services', categorySchema);

module.exports = Services;