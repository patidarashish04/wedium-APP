const dbServices = require('../../dao/queries/index');

// create category +
const createCategorys = async (category) => {
	try {
		const dbResponse = await dbServices.Category.createCategory(category);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const getCategoryByid = async (id) => {
	try {
		const dbResponse = await dbServices.Category.getCategoryByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const getAllCategory = async () => {
	try {
		const dbResponse = await dbServices.Category.getAllCategory();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const createCategorys2 = async (category) => {
	try {
		const dbResponse = await dbServices.Category.createCategory(category);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createCategorys,
	getCategoryByid,
	getAllCategory,
}; 
