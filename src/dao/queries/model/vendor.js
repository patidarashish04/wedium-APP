const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a name '],
        maxlength: 32,
    },
    email: {
        type: String,
        required: [true, 'Please add a email '],
    },
    profileImage: {
        type: String,
        default: null,
    },
    aadharcardupload: {
        type: String,
        required: [true, 'Please upload Aadharcard ']
    },
    pancardupload: {
        type: String,
        required: [true, 'Please upload Pancard ']
    },
    phone: {
        type: String,
        required: [true, 'Please add a Phone No.'],
      },
    password: {
        type: String,
        trim: true,
        required: [true, 'Please add a Password'],
        minlength: [6, 'Password must have at least six(6) characters'],
      },
}, { timestamps: true });

//we need to create collection
const Vendor = mongoose.model('Vendor', VendorSchema);

module.exports = Vendor;