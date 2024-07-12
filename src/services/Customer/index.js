const {
  createCustomers,
  getCustomerdata,
  getCustomerByid,
  getAllCustomer,
  updateCustomerByid,
  deleteCustomerByid,
  getCustomersPhoneNumber,
} = require("../Customer/function");

// GET Customer
const createCustomer = async (req, res) => {
  try {
    const body = req.body;
    // Validate Customer input
    if (!(body.fullName && body.email && body.phone)) {
      res.status(404).json("All Data Required");
    }
    const data = { phone: body.phone, email: body.email };
    // check if Customer already exist by phone
    const oldCustomerData = await getCustomerdata(data);
    if (oldCustomerData != 0) {
      res
        .status(404)
        .json({ message: "This Customer has already been created" });
    } else {
      const Customer = await createCustomers(body);
      res.status(200).json(Customer);
    }
  } catch (err) {
    res.status(500).json({ message: "Error creating Customer" });
  }
};

// retrieve and return all Customer
const getCustomer = async (req, res, next) => {
  getAllCustomer()
    .then((Customer) => {
      res.status(200).json({
        data: Customer,
        success: true,
        message: "Customer found",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Error Occurred while retriving Customer information",
      });
      next(err);
    });
};

getFormattedPhone = (phone) => {
  // Check if phone is defined and has a length property
  if (phone && phone.length) {
    let _ph = "";

    for (var i = phone.length; i > 0; i--) {
      if (_ph.split("").length != 10) {
        _ph += phone[i - 1];
      }
    }

    console.log("CUSTOMER NUMBER", `+91${_ph.split("").reverse().join("")}`);

    return `+91${_ph.split("").reverse().join("")}`;
  } else {
    console.error("Invalid phone number: ", phone);
    return "Invalid phone number";
  }
};

// retrieve and return all Customer
const getCustomerPhoneNumber = async (req, res, next) => {
  // console.log("REQ", req.query);
  // console.log("From", req.query.CallFrom);

  let vendorPhone = req.query.CallFrom;

  getCustomersPhoneNumber(getFormattedPhone(vendorPhone)).then(
    async (order) => {
      try {
        const phone = getFormattedPhone(order.vendorData.phone);
        if (order != null) {
          res.status(200).send({
            destination: {
              numbers: [phone],
            },
            record: true,
          });
        } else {
          res.status(404).json({ message: "order not found" });
        }
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error retrieving order with phone " + error });
      }
    }
  );

  // console.log('RES', res);
};

// retrive and return a single Customer
const FindOneCustomer = async (req, res, next) => {
  const id = req.params.id;
  getCustomerByid(id)
    .then(async (Customer) => {
      try {
        if (!Customer && Customer.id) {
          res.status(404).json({ message: "Not found Customer with id " + id });
        } else {
          res.status(200).json(Customer);
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error retrieving Customer with id " + id });
      }
    })
    .catch((err) => res.status(500).json(err));
};

// update Customer
const updateCustomer = async (req, res, next) => {
  const data = req.body;
  if (!data) {
    return res.status(400).json({ message: "Data to update can not be empty" });
  }
  const id = req.params.id;
  await updateCustomerByid(id, data)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update Customer with ${id}. Maybe Customer not found!`,
        });
      } else {
        res
          .status(200)
          .json({ message: " Successfully Updated Customer information" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update Customer information" });
    });
};
// delete Customer
const deleteCustomer = async (req, res, next) => {
  const id = req.params.id;
  await deleteCustomerByid(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.status(200).json({
          message: "Customer was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Could not delete Customer with id=" + id,
      });
    });
};

module.exports = {
  createCustomer,
  getCustomer,
  FindOneCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPhoneNumber,
};
