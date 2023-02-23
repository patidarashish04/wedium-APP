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
// get category by id +
const getCategoryByid = async (id) => {
	try {
		const dbResponse = await dbServices.Category.getCategoryByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get category by name +
const getCategoryByName = async (name) => {
	try {
		const dbResponse = await dbServices.Category.getCategoryByName(name);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All category +
const getAllCategory = async () => {
	try {
		const dbResponse = await dbServices.Category.getAllCategory();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const updateCategoryByid = async (id, data) => {
	try {
		const dbResponse = await dbServices.Category.updateCategoryByid(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const deleteCategoryByid = async (id) => {
	try {
		const dbResponse = await dbServices.Category.deleteCategoryByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createCategorys,
	getCategoryByid,
	getAllCategory,
	updateCategoryByid,
	deleteCategoryByid,
	getCategoryByName
};