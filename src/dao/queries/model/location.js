const mongoose = require('mongoose');

const locationSchemas = new mongoose.Schema({
    value: {
        type: Number,
        unique: true
    },
    text: {
        type: String,
        unique: true
    },
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
    //   },
    //   address: {
    //     type: String
    //   },
    //   city: {
    //     type: String
    //   },
    //   state: {
    //     type: String
    //   },
    //   country: {
    //     type: String
    //   },
    //   zipCode: {
    //     type: String
    //   }, 
    //   isDefault: {
    //     type: Boolean,
    //     default: false
    //   },
    //   updated: Date,
    //   created: {
    //     type: Date,
    //     default: Date.now
    //   },
});

//we need to create collection
const Location = mongoose.model('Location', locationSchemas);

module.exports = Location;