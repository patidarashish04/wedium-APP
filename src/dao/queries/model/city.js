const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  
      city: {
        type: String
      },
      state: {
        type: String
      }
});

//we need to create collection
const City = mongoose.model('City', CitySchema);

module.exports = City;