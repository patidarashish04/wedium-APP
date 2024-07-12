const {
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
} = require("../Order/function");
const { getCityByid } = require("../City/function");
const { getServicesByid } = require("../Services/function");
const { getVendorByid } = require("../Vendor/function");
const { Order } = require("..");
const moment = require("moment");

// create Order
const createNewOrder = async (req, res, next) => {
  try {
    const body = req.body;
    const cityId = req.body.cityId;
    const serviceId = req.body.serviceId;
    const vendorId = req.body.vendorId;
    // Validate Order input
    if (!(body.phone && body.bookingTime)) {
      res.status(404).json("BookingTime and Phone No. required");
    }
    if (cityId) {
      if (!cityId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(500).json({ message: "Invalid city id." });
      }
      var cities = await getCityByid(cityId);
      if (!cities) {
        return res.status(500).json({ message: "city data not found." });
      }
      body.cityData = cities;
    } else {
      res.status(404).json({ message: "City id not Found " });
    }
    if (serviceId) {
      if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(500).json({ message: "Invalid service Id." });
      }
      const service = await getServicesByid(serviceId);
      if (!service) {
        return res.status(500).json({ message: "service data not found." });
      }
      body.ServiceData = service;
    } else {
      res.status(404).json({ message: "service id not Found " });
    }

    if (vendorId) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      body.otp = otp;
      if (!vendorId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(500).json({ message: "Invalid service Id." });
      }
      const vendor = await getVendorByid(vendorId);
      if (!vendor) {
        return res.status(500).json({ message: "service data not found." });
      }
      body.vendorData = vendor;
    }
    // const orderCreatedDate = Date.now();
    // const newDate = moment(orderCreatedDate).format('DD-MM-YYYY');
    // body.orderDate = newDate;
    const Order = await createOrders(body);
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

// retrieve and return all Order
const getOrderByUserId = async (req, res, next) => {
  const id = req.params.id;
  getOrdersByUserId(id)
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
// retrieve and return all Order by only phone number
const getOrderByUserPhoneNumber = async (req, res, next) => {
  const phoneNumber = req.params.id;
  getOrderByPhoneNumber(phoneNumber)
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

// retrieve and return all Order
const getOrdersByVendorId = async (req, res, next) => {
  const id = req.params.id;
  getOrderByVendorId(id)
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

// retrieve and return all Order
const getClosedOrderByVendorId = async (req, res, next) => {
  const id = req.params.id;
  getClosedOrdersByVendorId(id)
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

// retrieve and return all Order
const getCompletedOrderByUserId = async (req, res, next) => {
  const id = req.params.id;
  getCompletedOrdersByUserId(id)
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
  const body = req.body;
  const cityId = req.body.cityId;
  const serviceId = req.body.serviceId;
  const vendorId = req.body.vendorId;
  // Validate Order input
  if (cityId) {
    if (!cityId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(500).json({ message: "Invalid city id." });
    }
    var cities = await getCityByid(cityId);
    if (!cities) {
      return res.status(500).json({ message: "city data not found." });
    }
  }
  if (serviceId) {
    if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(500).json({ message: "Invalid service Id." });
    }
    var service = await getServicesByid(serviceId);
    if (!service) {
      return res.status(500).json({ message: "service data not found." });
    }
  }
  if (vendorId) {
    if (!vendorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(500).json({ message: "Invalid vendor Id." });
    }
    var vendor = await getVendorByid(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "vendor data not found." });
    }
  }
  const orderId = req.params.id;
  await updateOrderById(orderId, {
    cityData: cities,
    ServiceData: service,
    vendorData: vendor,
    name: body.name,
    bookingTime: body.bookingTime,
    address: body.address,
    phone: body.phone,
    orderStatus: body.orderStatus,
    orderDate: body.orderDate,
  })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update order with ${
            (cityId, serviceId)
          }. Maybe service or city not found!`,
        });
      } else {
        res.status(200).json({ message: " Successfully updated Order" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update Order Information" });
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
        message: "Could not delete Order with id=" + id,
        err,
      });
    });
};
const completeBooking = async (req, res, next) => {
  const id = req.body.orderId;
  const otp = req.body.otp;
  console.log("ORDER ID", id);
  await completeOrder(id)
    .then(async (order) => {
      if (order) {
        if (order.orderStatus === "COMPLETED") {
          res.status(201).json({
            message: "Already Completed",
          });
        } else {
          if (order.otp === otp) {
            // res.status(200).json({
            //   message: "Success",
            //   data: order,
            // });
            await updateOrderById(id, {
              orderStatus: "COMPLETED",
              actionDate: Date.now(),
            })
              .then((data) => {
                if (!data) {
                  res.status(404).json({
                    message: `Cannot Update Order Status with ${id}. Maybe order not found!`,
                  });
                } else {
                  res
                    .status(200)
                    .json({ message: " Successfully Changed Order Status" });
                }
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ message: "Error Update Order Status", err });
              });
          } else {
            res.status(400).json({
              message: "Incorrect OTP",
            });
          }
        }
      } else {
        res.status(404).json({
          message: "Not found",
          data: null,
        });
      }
    })
    .catch((err) => {
      // console.log("Error" + err);
      res.status(500).json({
        message: "Error" + err,
        err,
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
  if (vendorId) {
    if (!vendorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(500).json({ message: "Invalid vendor id." });
    }
    var vendor = await getVendorByid(vendorId);
    if (!vendor) {
      return res.status(500).json({ message: "vendor data not found." });
    }
  } else {
    res.status(404).json({ message: "vendor id not Found " });
  }
  await updateOrderById(orderId, {
    vendorId: vendorId,
    vendorData: vendor,
    otp: otp,
  })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update Vendor with ${vendorId}. Maybe Vendor not found!`,
        });
      } else {
        res
          .status(200)
          .json({ message: " Successfully Assigned Vendor to Order" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update Order Information", err });
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
  })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update Order Status with ${orderId}. Maybe order not found!`,
        });
      } else {
        res.status(200).json({ message: " Successfully Changed Order Status" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update Order Status", err });
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
  getOrderByUserId,
  getCompletedOrderByUserId,
  getOrdersByVendorId,
  getClosedOrderByVendorId,
  completeBooking,
  getOrderByUserPhoneNumber,
};
