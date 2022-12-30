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
const findByIdAndUpdate = async (id, data) => {
	try {
		const dbResponse = await dbServices.Category.findCategoryUpdate(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const findByIdAndDelete = async (id) => {
	try {
		const dbResponse = await dbServices.Category.deleteCategory(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createCategorys,
	getCategoryByid,
	getAllCategory,
	findByIdAndUpdate,
	findByIdAndDelete,
}; 
