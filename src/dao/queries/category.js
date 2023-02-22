const Category = require('../queries/model/category');

const createCategory = (categoryBody) => Category.create(categoryBody);
const getCategoryByid = (id) => Category.findById(id);
const getCategoryByName = (name) => Category.find({ name });
const getAllCategory = () => Category.find();
const updateCategoryByid = (id, data) => Category.findByIdAndUpdate(id, data);
const deleteCategoryByid = (id) => Category.findByIdAndDelete(id);

module.exports = {
    createCategory,
    getCategoryByid,
    getAllCategory,
    updateCategoryByid,
    deleteCategoryByid,
    getCategoryByName
};