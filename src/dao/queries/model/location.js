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
   
});

//we need to create collection
const Location = mongoose.model('Location', locationSchemas);

module.exports = Location;