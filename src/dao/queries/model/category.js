const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a category_name '],
        maxlength: 32,
    },
    imagePath: {
        type: String,
        required: [true, 'Please add a category_image '],
        default: null,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'INACTIVE'
    },
    statusName: {
        type: String,
        default: null,
    },
    displayOrder: {
        type: Number,
        default: 0,
    },
},
);

//we need to create collection
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;