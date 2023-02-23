const dbServices = require('../../dao/queries/index');

// create category +
const createSubCategory = async (SubCategory) => {
	try {
		const dbResponse = await dbServices.SubCategory.createSubCategory(SubCategory);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get category by id +
const getSubCategoryByid = async (id) => {
	try {
		const dbResponse = await dbServices.SubCategory.getSubCategoryByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get category by name +
const getSubCategoryByName = async (name) => {
	try {
		const dbResponse = await dbServices.SubCategory.getSubCategoryByName(name);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All category +
const getAllSubCategory = async () => {
	try {
		const dbResponse = await dbServices.SubCategory.getAllSubCategory();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const updateSubCategoryById = async (id, data) => {
	try {
		const dbResponse = await dbServices.SubCategory.updateSubCategoryById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const deleteSubCategoryById = async id => {
	try {
		const dbResponse = await dbServices.SubCategory.deleteSubCategory(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createSubCategory,
	getSubCategoryByid,
	getAllSubCategory,
	updateSubCategoryById,
	deleteSubCategoryById,
	getSubCategoryByName
};