const Category = require('../queries/model/category');

const createCategory = (categoryBody) => Category.create(categoryBody);
const getCategoryByid = (id) => Category.findById(id);
const getAllCategory = () => Category.find();
const findCategoryUpdate = (id, data) => Category.findByIdAndUpdate(id, data);
const deleteSubCategoryById = (id) => Category.findByIdAndDelete(id);


module.exports = {
    createCategory,
    getCategoryByid,
    getAllCategory,
    findCategoryUpdate,
    deleteSubCategoryById,
};
