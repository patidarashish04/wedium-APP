const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    vendorName: {
        type: String,
        trim: true,
        required: [true, 'Please add a category_name '],
        maxlength: 32
    },
    email: {
        type: String,
        required: [true, 'Please add a category_image ']
    },
    imagelocation: {
        type: String
    },
    imagekey: {
        type: String
    },
    phone: {
        type: Number
    },
    password: {
        type: String
    }
}, { timestamps: true });

//we need to create collection
const Vendor = mongoose.model('Vendor', VendorSchema);

module.exports = Vendor;