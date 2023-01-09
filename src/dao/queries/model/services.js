const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    subCatgoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
        required: [true, 'sub subCatgoryId required'],
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a service_name'],
        maxlength: 32,
    },
    serviceImage: {
        type: String,
        required: [true, 'Please add a serviceImage'],
    },
    absoluteServicePath: {
        type: String,
    },
    descriptions: {
        type: String,
        required: true
    },
    note: {
        type: String,
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
}, { timestamps: true });

const Services = mongoose.model('Services', categorySchema);

module.exports = Services;