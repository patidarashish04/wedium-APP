const dbServices = require('../../dao/queries/index');

// create category +
const createUser = async User => {
	try {
		const dbResponse = await dbServices.User.createUser(User);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get category by id +
const getUserByPhone = async (phone) => {
	try {
		const dbResponse = await dbServices.User.getUserByPhone(phone);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get category by id +
const oldUserByEmail = async (email) => {
	try {
		const dbResponse = await dbServices.User.oldUserByEmail(email);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All category +
const getAllUser = async () => {
	try {
		const dbResponse = await dbServices.User.getAllUser();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const updateUserById = async (id, data) => {
	try {
		const dbResponse = await dbServices.User.findUserUpdate(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const deleteUserById = async id => {
	try {
		const dbResponse = await dbServices.User.deleteUser(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createUser,
	getUserByPhone,
	oldUserByEmail,
	getAllUser,
	updateUserById,
	deleteUserById
};