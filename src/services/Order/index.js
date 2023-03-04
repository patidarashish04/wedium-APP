const {
  createOrders,
  getOrderByid,
  getAllOrder,
  updateOrderById,
  deleteOrderById,
} = require("../Order/function");
const { getCityByid } = require('../City/function');
const { getServicesByid } = require('../Services/function');

// GET Order
const createNewOrder = async (req, res, next) => {
  try {
    const body = req.body;
    const cityId = req.body.cityId
    const serviceId = req.body.serviceId
    // Validate Order input
    var Order;
    // try {
      if (cityId) {
        if (!(cityId.match(/^[0-9a-fA-F]{24}$/))) { return res.status(500).json({ message: 'Invalid city id.' }) };
        var cities = await getCityByid(cityId);
        if (!(cities)) { return res.status(500).json({ message: 'city data not found.'}) };
        body.cityData = cities;
      } else {
        res.status(404).json({ message: 'City id not Found ' });
      }
      if (serviceId) {
        if (!(serviceId.match(/^[0-9a-fA-F]{24}$/))) { return res.status(500).json({ message: 'Invalid service Id.' }) };
        const service = await getServicesByid(serviceId);
        if (!(service)) { return res.status(500).json({ message: 'service data not found.'}) };
        body.ServiceData = service;
      } else {
        res.status(404).json({ message: 'service id not Found ' });
      }
     Order = await createOrders(body);
    // } catch (err) {
    //   res.status(406).json({ data: err.message, message: "Failed" });
    // }
    res.status(200).json({ data: Order, message: "success" });
  } catch (error) {
    console.log("ERROR", error);
  }
};
// retrieve and return all Order
const getOrderList = async (req, res, next) => {
  getAllOrder()
    .then((Order) => {
      res.status(200).json({
        data: Order,
        success: true,
        message: null,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Error Occurred while retriving Order information",
      });
      next(err);
    });
};

// retrive and return a single Order
const getSingleOrder = async (req, res, next) => {
  const id = req.params.id;
  getOrderByid(id)
    .then(async (category) => {
      try {
        if (!category && category.id) {
          res.status(404).json({ message: "Not found Order with id " + id });
        } else {
          res.json(category);
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error retrieving Order with id " + id });
      }
    })
    .catch((err) => res.status(500).json(err));
};

// update Order
const updateOrder = async (req, res, next) => {
  const data = req.body;
  if (!data) {
    return res.status(400).json({ message: "Data to update can not be empty" });
  }
  const id = req.params.id;
  await updateOrderById(id, data)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update Order with ${id}. Maybe Order not found!`,
        });
      } else {
        res
          .status(200)
          .json({ message: " Successfully Updated Order information" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update Order information" });
    });
};

// delete Order
const deleteOrder = async (req, res, next) => {
  const id = req.params.id;
  await deleteOrderById(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.json({
          message: "Order was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Could not delete Order with id=" + id, err
      });
    });
};

// assign vendor to order
const assignVendorToOrder = async (req, res, next) => {
    const vendorId = req.body.vendorId;
    const orderId = req.body.orderId;

    const otp = Math.floor(1000 + Math.random() * 9000);

    // Validate Order input
    if (!(vendorId && orderId)) {
      res.status(404).json("vendorId and orderId Required");
    }
    await updateOrderById(orderId, {
      vendorId: vendorId,
      otp: otp,
    }).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update Vendor with ${vendorId}. Maybe Vendor not found!` });
        } else {
            res.status(200).json({ message: " Successfully Assigned Vendor to Order" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update Order Information" , err});
    });
};

//  UPDATE THE STATUS OF ORDER
//OPEN , PENDING , COMPLETED , CANCELED
const updateOrderStatus = async (req, res, next) => {
    const reqOrderStatus = req.body.orderStatus;
    const orderId = req.params.id;
    const status = await getOrderByid(orderId);
    // if (status.orderStatus === "OPEN") {
    await updateOrderById(orderId, {
        orderStatus: reqOrderStatus,
        actionDate: Date.now(),
      }).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update Order Status with ${orderId}. Maybe order not found!` });
        } else {
            res.status(200).json({ message: " Successfully Changed Order Status" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update Order Status" , err});
    });
// }
};

module.exports = {
  createNewOrder,
  getOrderList,
  getSingleOrder,
  updateOrder,
  deleteOrder,
  assignVendorToOrder,
  updateOrderStatus,
};
