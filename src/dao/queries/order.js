const Order = require("../queries/model/order");
const mongoose = require("mongoose");

const createOrders = (orderBody) => Order.create(orderBody);
const getOrderByid = (id) => Order.findById(id);
const getOrdersByUserId = async (id) =>
  await Order.find({
    userId: id,
    orderStatus: { $in: [ "OPEN" , "PROCESSING" , "PENDING"] }  ,
  });
const getCompletedOrdersByUserId = async (id) =>
  await Order.find({ userId: id, orderStatus: { $in: [ "COMPLETED" , "CANCELED" ] }  });
const getAllOrder = () => Order.find();
const updateOrderById = (id, data) => Order.findByIdAndUpdate(id, data);
const deleteOrderById = (id) => Order.findByIdAndDelete(id);

module.exports = {
  createOrders,
  getOrderByid,
  getAllOrder,
  updateOrderById,
  deleteOrderById,
  getOrdersByUserId,
};
