const Customer = require("../queries/model/customer");
const Order = require("../queries/model/order");

const createCustomer = (CustomerBody) => Customer.create(CustomerBody);
const getCustomerdata = (data) =>
  Customer.find({ $or: [{ phone: data.phone }, { email: data.email }] });
const getCustomerByid = (id) => Customer.findById(id);
const getAllCustomer = () => Customer.find();
const updateCustomerByid = (id, data) => Customer.findByIdAndUpdate(id, data);
const deleteCustomerByid = (id) => Customer.findByIdAndDelete(id);
const getCustomerPhoneNumber = (phone) =>
  Order.findOne({
    phone: { $regex: phone },
    orderStatus: { $in: ["OPEN", "PENDING", "PROCESSING"] },
    vendorData: { $exists: true },
  });

module.exports = {
  createCustomer,
  getCustomerdata,
  getCustomerByid,
  getAllCustomer,
  updateCustomerByid,
  deleteCustomerByid,
  getCustomerPhoneNumber,
};
