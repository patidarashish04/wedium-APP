const Category = require('../queries/model/category');

const createCategory = (categoryBody) => Category.create(categoryBody);
const getCategoryByid = (id) => Category.findById(id);
const getAllCategory = () => Category.find();


module.exports = {
    createCategory,
    getCategoryByid,
    getAllCategory,
};
