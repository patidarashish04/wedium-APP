const dbServices = require('../../dao/queries/index');

// create SubCategory +
const createSubCategory = async (SubCategory) => {
	try {
		const dbResponse = await dbServices.SubCategory.createSubCategory(SubCategory);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get SubCategory by id +
const getSubCategoryByid = async (id) => {
	try {
		const dbResponse = await dbServices.SubCategory.getSubCategoryByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get SubCategory By CategoryId +
const getSubCategoryByCategoryId = async (id) => {
	try {
		const dbResponse = await dbServices.SubCategory.getSubCategoryByCategoryId(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get SubCategory by name +
const getSubCategoryByName = async (name) => {
	try {
		const dbResponse = await dbServices.SubCategory.getSubCategoryByName(name);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All SubCategory +
const getAllSubCategory = async () => {
	try {
		const dbResponse = await dbServices.SubCategory.getAllSubCategory();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create SubCategory +
const updateSubCategoryById = async (id, data) => {
	try {
		const dbResponse = await dbServices.SubCategory.updateSubCategoryById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete SubCategory +
const deleteSubCategoryById = async (id) => {
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
	getSubCategoryByName,
	getSubCategoryByCategoryId
};