const Order = require("../queries/model/order");
const mongoose = require("mongoose");

const createOrders = (orderBody) => Order.create(orderBody);
const getOrderByid = (id) => Order.findById(id);

const getOrdersByUserId = async (id) =>
  await Order.find({
    userId: id,
    orderStatus: { $in: ["OPEN", "PROCESSING", "PENDING"] },
  });
const getOrderByVendorId = async (_id) => {
  console.log("QWERTYUI", _id);
  return await Order.find({
    "vendorData._id": mongoose.Types.ObjectId(_id),
    orderStatus: { $in: ["OPEN", "PROCESSING", "PENDING"] },
  });
};
const getOrderByPhoneNumber = async (phoneNumber) => {
  console.log("PhoneNumber", phoneNumber);

  // Remove any non-digit characters and keep the last 10 digits
  const sanitizedPhoneNumber = phoneNumber.replace(/\D/g, "").slice(-10);

  console.log("sanitizedPhoneNumber", sanitizedPhoneNumber);

  return await Order.find({
    phone: { $regex: sanitizedPhoneNumber },
    userId: { $exists: false },
    orderStatus: { $in: ["OPEN", "PROCESSING", "PENDING"] },
  });
};
const completeOrder = async (id) => {
  return await Order.findOne({
    _id: mongoose.Types.ObjectId(id),
  });
};

const getClosedOrderByVendorId = async (_id) => {
  console.log("QWERTYUI", _id);
  return await Order.find({
    "vendorData._id": mongoose.Types.ObjectId(_id),
    orderStatus: { $in: ["CANCELED", "COMPLETED"] },
  });
};
const getCompletedOrdersByUserId = async (id) =>
  await Order.find({
    userId: id,
    orderStatus: { $in: ["COMPLETED", "CANCELED"] },
  });
const getAllOrder = () => Order.find().sort({ createdAt: -1 }).limit(60);

const updateOrderById = (id, data) => Order.findByIdAndUpdate(id, data);
const deleteOrderById = (id) => Order.findByIdAndDelete(id);

module.exports = {
  createOrders,
  getOrderByid,
  getAllOrder,
  updateOrderById,
  deleteOrderById,
  getOrdersByUserId,
  getCompletedOrdersByUserId,
  getOrderByVendorId,
  getClosedOrderByVendorId,
  completeOrder,
  getOrderByPhoneNumber,
};
