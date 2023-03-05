const dbServices = require('../../dao/queries/index');

// create Services +
const createServices = async (body) => {
	try {
		const dbResponse = await dbServices.Services.createService(body);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get Services by id +
const getServicesByid = async (id) => {
	try {
		const dbResponse = await dbServices.Services.getServicesByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get SubCategory by id +
const getserviceBySubCategoryid = async (id) => {
	try {
		const dbResponse = await dbServices.Services.getserviceBySubCategoryid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get Services by name +
const getServicesByName = async (name) => {
	try {
		const dbResponse = await dbServices.Services.getServicesByName(name);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All Services +
const getAllServices = async () => {
	try {
		const dbResponse = await dbServices.Services.getAllServices();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get All BestSeller +
const BestSeller = async () => {
	try {
		const dbResponse = await dbServices.Services.BestSeller();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// create Services +
const updateServicesById = async (id, data) => {
	try {
		const dbResponse = await dbServices.Services.updateServicesById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete Services +
const deleteServicesById = async (id) => {
	try {
		const dbResponse = await dbServices.Services.deleteServicesById(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createServices,
	getServicesByid,
	getAllServices,
	updateServicesById,
	deleteServicesById,
	BestSeller,
	getServicesByName,
	getserviceBySubCategoryid
};