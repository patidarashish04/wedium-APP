const dbServices = require('../../dao/queries/index');

// create category +
const createOrders = async (orderBody) => {
	try {
		const dbResponse = await dbServices.Order.createOrders(orderBody);
		return dbResponse;
	} catch (err) {
		// return err;
		throw  Error(err);
	}
};
// get category by id +
const getOrderByid = async (id) => {
	try {
		const dbResponse = await dbServices.Order.getOrderByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All category +
const getAllOrder = async () => {
	try {
		const dbResponse = await dbServices.Order.getAllOrder();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const updateOrderById = async (id, data) => {
	try {
		const dbResponse = await dbServices.Order.updateOrderById(id,data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const deleteOrderById = async (id) => {
	try {
		const dbResponse = await dbServices.Order.deleteOrderById(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const getOrdersByUserId = async (id) => {
	try {
		const dbResponse = await dbServices.Order.getOrdersByUserId(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const getCompletedOrdersByUserId = async (id) => {
	try {
		const dbResponse = await dbServices.Order.getCompletedOrdersByUserId(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createOrders,
	getOrderByid,
	getAllOrder,
	updateOrderById,
	deleteOrderById,
	getOrdersByUserId,
	getCompletedOrdersByUserId,
}; 
