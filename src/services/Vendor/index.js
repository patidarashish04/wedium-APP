const {
  createVendor,
  getVendorByid,
  getVendordata,
  getAllVendor,
  updateVendorById,
  deleteVendorById,
  loginVendors,
} = require("../Vendor/function");
const dotenv = require("dotenv");
dotenv.config(".env.local");
const bcrypt = require("bcrypt");
const createVendors = async (req, res, next) => {
  try {
    const body = req.body;
    // Validate user input
    if (!(body.phone && body.email)) {
      res.status(404).json("All input is required");
    }
    const data = { phone: body.phone, email: body.email };
    // check if user already exist by phone
    const oldVendorData = await getVendordata(data);
    if (oldVendorData != 0) {
      return res.status(409).json("Vendor Already Exist..");
    } else {
      // Encrypt user password
      encryptedPassword = await bcrypt.hash(body.password, 5);
      const options = {
        name: body.name,
        email: body.email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        phone: body.phone,
        profileImage: body.profileImage,
        aadharcardupload: body.aadharcardupload,
        pancardupload: body.pancardupload,
      };
      // Create Vendor in our database
      const vendor = await createVendor(options);
      res.status(200).json({ VendorDetails: vendor });
    }
  } catch (err) {
    res.status(500).json({ message: "Error creating vendor" });
  }
};

// retrieve and return all vendor
const getVendor = async (req, res, next) => {
  getAllVendor()
    .then((vendor) => {
      res.status(200).json({
        data: vendor,
        success: true,
        message: null,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Error Occurred while retriving vendor information",
      });
      next(err);
    });
};

// retrive and return a single vendor
const FindOneVendor = async (req, res, next) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(500).json({ message: "Invalid Category id." });
  }
  getVendorByid(id)
    .then(async (vendor) => {
      try {
        if (!vendor && vendor.id) {
          res.status(404).json({ message: "Not found vendor with id " + id });
        } else {
          res.status(200).json(vendor);
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error retrieving vendor with id " + id });
      }
    })
    .catch((err) => res.status(500).json(err));
};

// update vendor
const updateVendor = async (req, res, next) => {
  const data = req.body;
  if (!data) {
    return res.status(400).json({ message: "Data to update can not be empty" });
  }
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(500).json({ message: "Invalid Category id." });
  }
  // Encrypt user password
  encryptedPassword = await bcrypt.hash(data.password, 5);
  const vendor = {
    name: data.name,
    email: data.email.toLowerCase(), // sanitize: convert email to lowercase
    password: encryptedPassword,
    phone: data.phone,
    profileImage: data.profileImage,
    aadharcardupload: data.aadharcardupload,
    pancardupload: data.pancardupload,
  };
  await updateVendorById(id, vendor)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update vendor with ${id}. Maybe vendor not found!`,
        });
      } else {
        res
          .status(200)
          .json({ message: " Successfully Updated Vendor information" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update vendor information" });
    });
};

// delete vendor
const deleteVendor = async (req, res, next) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(500).json({ message: "Invalid Category id." });
  }
  await deleteVendorById(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.status(200).json({
          message: "vendor was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Could not delete vendor with id=" + id,
      });
    });
};

// delete vendor
// const loginVendor = async (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   await loginVendors(email, password).then((vendor) => {
//     try {
//       console.log("logguiiiin  guhgui", vendor);
//       if (vendor) {
//         res.status(200).json({
//           message: "Vendor Found",
//           data: vendor,
//         });
//       } else {
//         res.status(404).json({
//           message: "Vendor Not Found",
//         });
//       }
//     } catch (error) {
//       res.status(error).json({
//         message: "Error" + error,
//       });
//     }
//   });
// };
const loginVendor = async (req, res, next) => {
  const email = req.body.email;

  try {
    const vendor = await loginVendors(email);

    if (vendor && (await bcrypt.compare(req.body.password, vendor.password))) {
      res.status(200).json({
        message: "Vendor Found",
        data: vendor,
      });
    } else {
      res.status(404).json({
        message: "Vendor Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error: " + error,
    });
  }
};

module.exports = {
  createVendors,
  getVendor,
  FindOneVendor,
  updateVendor,
  deleteVendor,
  loginVendor,
};
