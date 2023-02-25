const Customer = require('../queries/model/customer');

const createCustomer = (CustomerBody) => Customer.create(CustomerBody);
const getCustomerByid = (id) => Customer.findById(id);
const getAllCustomer = () => Customer.find();
const updateCustomerByid = (id, data) => Customer.findByIdAndUpdate(id, data);
const deleteCustomerByid = (id) => Customer.findByIdAndDelete(id);


module.exports = {
    createCustomer,
    getCustomerByid,
    getAllCustomer,
    updateCustomerByid,
    deleteCustomerByid,
};