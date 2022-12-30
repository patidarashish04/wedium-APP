const dbServices = require('../../dao/queries/index');

// create category +
const createService = async (Services) => {
	try {
		const dbResponse = await dbServices.Services.createService(Services);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get category by id +
const getServicesByid = async (id) => {
	try {
		const dbResponse = await dbServices.Services.getServicesByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All category +
const getAllServices = async () => {
	try {
		const dbResponse = await dbServices.Services.getAllServices();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const updateServicesById = async (id, data) => {
	try {
		const dbResponse = await dbServices.Services.updateServicesById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const deleteServicesById = async (id) => {
	try {
		const dbResponse = await dbServices.Services.deleteServicesById(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createService,
    getServicesByid,
    getAllServices,
    updateServicesById,
	deleteServicesById}; 
