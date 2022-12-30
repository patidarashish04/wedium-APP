const Services = require('../queries/model/services');

const createService = (ServicesBody) => Services.create(ServicesBody);
const getServicesByid = (id) => Services.findById(id);
const getAllServices = () => Services.find();
const updateServicesById = (id, data) => Services.findByIdAndUpdate(id, data);
const deleteServicesById = (id) => Services.findByIdAndDelete(id);


module.exports = {
    createService,
    getServicesByid,
    getAllServices,
    updateServicesById,
    deleteServicesById,
};
