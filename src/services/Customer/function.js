const dbServices = require('../../dao/queries/index');

// create Customer +
const createCustomers = async (Customer) => {
	try {
		const dbResponse = await dbServices.Customer.createCustomer(Customer);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get Customer by id +
const getCustomerByid = async (id) => {
	try {
		const dbResponse = await dbServices.Customer.getCustomerByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get Customer by name +
const getCustomerByName = async (name) => {
	try {
		const dbResponse = await dbServices.Customer.getCustomerByName(name);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All Customer +
const getAllCustomer = async () => {
	try {
		const dbResponse = await dbServices.Customer.getAllCustomer();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create Customer +
const updateCustomerByid = async (id, data) => {
	try {
		const dbResponse = await dbServices.Customer.updateCustomerByid(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete Customer +
const deleteCustomerByid = async (id) => {
	try {
		const dbResponse = await dbServices.Customer.deleteCustomerByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createCustomers,
	getCustomerByid,
	getAllCustomer,
	updateCustomerByid,
	deleteCustomerByid,
	getCustomerByName
};