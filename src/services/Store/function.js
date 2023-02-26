const dbServices = require('../../dao/queries/index');
// create Store +
const createStore = async (Store) => {
	try {
		const dbResponse = await dbServices.Store.createStore(Store);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get Store by id +
const getStoreByid = async (id) => {
	try {
		const dbResponse = await dbServices.Store.getStoreByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get Store  +
const getStoredata = async (data) => {
	try {
		const dbResponse = await dbServices.Store.getStoredata(data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get All Store +
const getAllStore = async () => {
	try {
		const dbResponse = await dbServices.Store.getAllStore();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create Store +
const updateStoreById = async (id, data) => {
	try {
		const dbResponse = await dbServices.Store.updateStoreById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete Store +
const deleteStoreById = async (id) => {
	try {
		const dbResponse = await dbServices.Store.deleteStorebyid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};


module.exports = {
	createStore,
	getStoreByid,
	getStoredata,
	getAllStore,
	updateStoreById,
	deleteStoreById
}; 
