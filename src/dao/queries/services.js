const Services = require('../queries/model/services');

const createService = (ServicesBody) => Services.create(ServicesBody);
const getServicesByid = (id) => Services.find({ subCatgoryId : id });
const getServicesByName = (name) => Services.find({ name });
const getAllServices = () => Services.find();
const updateServicesById = (id, data) => Services.findByIdAndUpdate(id, data);
const deleteServicesById = (id) => Services.findByIdAndDelete(id);
const BestSeller = () => Services.find({isBestSeller: true});


module.exports = {
    createService,
    getServicesByid,
    getServicesByName,
    getAllServices,
    updateServicesById,
    deleteServicesById,
    BestSeller,
};
