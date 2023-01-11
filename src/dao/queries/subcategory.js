const SubCategory = require('../queries/model/subCategory');

const createSubCategory = (categoryBody) => SubCategory.create(categoryBody);
const getSubCategoryByid = (id) => SubCategory.find({ categoryId : id });
const getAllSubCategory = () => SubCategory.find();
const updateSubCategoryById = (id, data) => SubCategory.findByIdAndUpdate(id, data);
const deleteSubCategory = (id) => SubCategory.findByIdAndDelete(id);


module.exports = {
    createSubCategory,
    getSubCategoryByid,
    getAllSubCategory,
    updateSubCategoryById,
    deleteSubCategory,
};
