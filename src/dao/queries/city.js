const City = require('../queries/model/city');

const createCity = (CityBody) => City.create(CityBody);
const getCityByid = (id) => City.findById(id);
const getAllCity = () => City.find();
const updateCityByid = (id, data) => City.findByIdAndUpdate(id, data);
const deleteCityByid = (id) => City.findByIdAndDelete(id);

module.exports = {
    createCity,
    getCityByid,
    getAllCity,
    updateCityByid,
    deleteCityByid,
};