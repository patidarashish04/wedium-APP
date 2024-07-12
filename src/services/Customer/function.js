const dbServices = require("../../dao/queries/index");

// create Customer +
const createCustomers = async (Customer) => {
  try {
    const dbResponse = await dbServices.Customer.createCustomer(Customer);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get Customer +
const getCustomerdata = async (data) => {
  try {
    const dbResponse = await dbServices.Customer.getCustomerdata(data);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get Customer by id +
const getCustomerByid = async (id) => {
  try {
    const dbResponse = await dbServices.Customer.getCustomerByid(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get Customer phone number
const getCustomersPhoneNumber = async (phone) => {
  try {
    const dbResponse = await dbServices.Customer.getCustomerPhoneNumber(phone);
    return dbResponse;
  } catch (err) {
    console.log(`ERROR IN PHONE NUMBER ${err}`);
    return null;
  }
};
// get All Customer +
const getAllCustomer = async () => {
  try {
    const dbResponse = await dbServices.Customer.getAllCustomer();
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};
// create Customer +
const updateCustomerByid = async (id, data) => {
  try {
    const dbResponse = await dbServices.Customer.updateCustomerByid(id, data);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// delete Customer +
const deleteCustomerByid = async (id) => {
  try {
    const dbResponse = await dbServices.Customer.deleteCustomerByid(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};
module.exports = {
  createCustomers,
  getCustomerByid,
  getCustomerdata,
  getAllCustomer,
  updateCustomerByid,
  deleteCustomerByid,
  getCustomersPhoneNumber,
};
