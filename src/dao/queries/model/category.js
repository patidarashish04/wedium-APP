const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a category_name '],
        maxlength: 32,
        // unique :true
    },
    imagePath: {
        type: String,
        required: [true, 'Please add a category_image '],
    },
    // category_banner_image: {
    //     type: String,
    //     required: [true, 'Please add a category_banner_image '],
    // },
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