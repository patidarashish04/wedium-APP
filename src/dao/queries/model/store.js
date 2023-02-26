const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    vendorData: {
        type: Object,
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a name '],
        maxlength: 32,
    },
    Website: {
        type: String
    },
    phone: {
        type: String,
        required: [true, 'Please add a Phone No.'],
    },
    Image: {
        type: String,
        required: [true, 'Please upload Image ']
    },
    about: {
        type: String
    },
    address: {  
        type: String
    },
    state: {
        type: String,
        enum: ['Odisha'],
    },
    city: {
        type: String,
        enum: ['Bhubaneswar'],
    },
    longitude: {
        type: Number,
    },
    lattitude: {
        type: Number,
    },
}, { timestamps: true },
);

//we need to create collection
const Store = mongoose.model('Store', StoreSchema);

module.exports = Store;