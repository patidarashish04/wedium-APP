const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: [true, 'SubCategory must be belong to parent category']
    },
    name: {
        type: String,
        required: [true, 'Please add a subcategory name'],
        unique: true
    },
    imagePath: {
        type: String,
        required: [true, 'Please add a image Path']
    },
    bannerPath: {
        type: String
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'INACTIVE'
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const SubCategory = mongoose.model('SubCategory', categorySchema);

module.exports = SubCategory;