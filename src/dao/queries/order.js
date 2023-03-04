const Order = require('../queries/model/order');

const createOrders = (orderBody) => Order.create(orderBody);
const getOrderByid = (id) => Order.findById(id);
const getAllOrder = () => Order.find();
const updateOrderById = (id, data) => Order.findByIdAndUpdate(id, data);
const deleteOrderById = (id) => Order.findByIdAndDelete(id);


module.exports = {
    createOrders,
    getOrderByid,
    getAllOrder,
    updateOrderById,
    deleteOrderById,
};
