const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true,
        required: [true, 'categoryId required'],
    },
    sub_category_name: {
        type: String,
        trim: true,
        required: [true, 'Please add a sub_category_name'],
        maxlength: 32,
    },
    sub_category_image: {
        type: String,
        required: [true, 'Please add a sub_category_image'],
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