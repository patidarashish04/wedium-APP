const dbServices = require('../../dao/queries/index');

// create User +
const createUser = async (User) => {
	try {
		const dbResponse = await dbServices.User.createUser(User);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get User by id +
const getUserByPhone = async (phone) => {
	try {
		const dbResponse = await dbServices.User.getUserByPhone(phone);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get otp by phone +
const getOTPByPhone = async (phone) => {
	try {
		const dbResponse = await dbServices.User.getOTPByPhone(phone);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get User  +
const getUserdata = async (data) => {
	try {
		const dbResponse = await dbServices.User.getUserdata(data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All User +
const getAllUser = async () => {
	try {
		const dbResponse = await dbServices.User.getAllUser();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create User +
const updateUserById = async (id, data) => {
	try {
		const dbResponse = await dbServices.User.findUserUpdate(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete User +
const deleteUserById = async (id) => {
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
	getUserdata,
	getAllUser,
	updateUserById,
	deleteUserById,
	getOTPByPhone
};