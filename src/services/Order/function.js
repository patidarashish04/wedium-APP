const dbServices = require("../../dao/queries/index");

// create Orders +
const createOrders = async (orderBody) => {
  try {
    const dbResponse = await dbServices.Order.createOrders(orderBody);
    return dbResponse;
  } catch (err) {
    // return err;
    throw Error(err);
  }
};
// get Orders by id +
const getOrderByid = async (id) => {
  try {
    const dbResponse = await dbServices.Order.getOrderByid(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};
// get All Orders +
const getAllOrder = async () => {
  try {
    const dbResponse = await dbServices.Order.getAllOrder();
    return dbResponse;
  } catch (err) {
    throw new Error(err.message);
  }
};

// update Orders +
const updateOrderById = async (id, data) => {
  try {
    const dbResponse = await dbServices.Order.updateOrderById(id, data);
    console.log("REQ : ", data);
    // console.log("RES : ", dbResponse);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// delete Orders by id +
const deleteOrderById = async (id) => {
  try {
    const dbResponse = await dbServices.Order.deleteOrderById(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get completeOrder +
const completeOrder = async (id) => {
  try {
    const dbResponse = await dbServices.Order.completeOrder(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get getOrdersByUserId +
const getOrdersByUserId = async (id) => {
  try {
    const dbResponse = await dbServices.Order.getOrdersByUserId(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get getOrdersByPhoneNumber
const getOrderByPhoneNumber = async (phoneNumber) => {
  try {
    const dbResponse = await dbServices.Order.getOrderByPhoneNumber(phoneNumber);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get getOrderByVendorId +
const getOrderByVendorId = async (id) => {
  try {
    const dbResponse = await dbServices.Order.getOrderByVendorId(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get getClosedOrdersByVendorId +
const getClosedOrdersByVendorId = async (id) => {
  try {
    const dbResponse = await dbServices.Order.getClosedOrderByVendorId(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// CompletedOrdersByUserId  +
const getCompletedOrdersByUserId = async (id) => {
  try {
    const dbResponse = await dbServices.Order.getCompletedOrdersByUserId(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};
module.exports = {
  createOrders,
  getOrderByid,
  getAllOrder,
  updateOrderById,
  deleteOrderById,
  getOrdersByUserId,
  getCompletedOrdersByUserId,
  getOrderByVendorId,
  getClosedOrdersByVendorId,
  completeOrder,
  getOrderByPhoneNumber,
};
