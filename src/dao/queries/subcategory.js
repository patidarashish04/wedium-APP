const SubCategory = require('../queries/model/subCategory');
const mongoose = require('mongoose');

const createSubCategory = (categoryBody) => SubCategory.create(categoryBody);
const getSubCategoryByid = (id) => SubCategory.findById( id );
// const id = mongoose.Types.ObjectId("63f7cc7b2861aebc9be511a6");
const getSubCategoryByCategoryId = async (_id) => await SubCategory.find(({"categoryData._id": mongoose.Types.ObjectId(_id)}));
// const getSubCategoryByCategoryId = (id) => SubCategory.findById( id );
const getSubCategoryByName = (name) => SubCategory.find({ name });
const getAllSubCategory = () => SubCategory.find();
const updateSubCategoryById = (id, data) => SubCategory.findByIdAndUpdate(id, data);
const deleteSubCategory = (id) => SubCategory.findByIdAndDelete(id);

module.exports = {
    createSubCategory,
    getSubCategoryByid,
    getAllSubCategory,
    updateSubCategoryById,
    deleteSubCategory,
    getSubCategoryByName,
    getSubCategoryByCategoryId
};