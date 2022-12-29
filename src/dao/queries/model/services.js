const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    SubCategory_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required:true,
        required: [true, 'sub categoryId required'],
    },
    service_name: {
        type: String,
        trim: true,
        required: [true, 'Please add a service_name'],
        maxlength: 32,
    },
    service_images: {
        type: String,
        required: [true, 'Please add a service_images'],
    },
    service_banner_image: {
        type: String,
        required: [true, 'Please add a service_banner_image '],
    },
    service_description: {
        type: String,
        required: true
    },
    notes : {
        type: String,
    },
    price : {
        type: Number,
        default:0
    },
    discount : {
        type: Number,
        default:0
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'INACTIVE'
    },
}, { timestamps: true });

const Services = mongoose.model('Services', categorySchema );

module.exports = Services;