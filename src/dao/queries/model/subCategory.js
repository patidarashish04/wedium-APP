const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryData: {
        type: Object,
    },
    name: {
        type: String,
        required: [true, 'Please add a subcategory name'],
        unique:true,
    },
    imagePath: {
        type: String,
        required: [true, 'Please add a image Path'],
        default: null,
    },
    bannerPath: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'INACTIVE'
    },
    displayOrder: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const SubCategory = mongoose.model('SubCategory', categorySchema);

module.exports = SubCategory;