const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});

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
    image: [imageSchema], // Updated to store an array of image objects
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