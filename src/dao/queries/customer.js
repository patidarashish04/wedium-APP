const Customer = require('../queries/model/customer');

const createCustomer = (CustomerBody) => Customer.create(CustomerBody);
const getCustomerdata = (data) => Customer.find( {$or: [ {phone: data.phone }, { email: data.email } ]} );
const getCustomerByid = (id) => Customer.findById(id);
const getAllCustomer = () => Customer.find();
const updateCustomerByid = (id, data) => Customer.findByIdAndUpdate(id, data);
const deleteCustomerByid = (id) => Customer.findByIdAndDelete(id);


module.exports = {
    createCustomer,
    getCustomerdata,
    getCustomerByid,
    getAllCustomer,
    updateCustomerByid,
    deleteCustomerByid,
};