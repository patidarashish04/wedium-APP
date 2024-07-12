const dbServices = require("../../dao/queries/index");
const { generateS3FileKey } = require("../../utils/s3Utils");
// create Vendor +
const createVendor = async (vendor) => {
  try {
    const dbResponse = await dbServices.Vendor.createVendor(vendor);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};
// get Vendor by id +
const getVendorByid = async (id) => {
  try {
    const dbResponse = await dbServices.Vendor.getVendorByid(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get Vendor  +
const getVendordata = async (data) => {
  try {
    const dbResponse = await dbServices.Vendor.getVendordata(data);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// get All Vendor +
const getAllVendor = async () => {
  try {
    const dbResponse = await dbServices.Vendor.getAllVendor();
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};
// create Vendor +
const updateVendorById = async (id, data) => {
  try {
    const dbResponse = await dbServices.Vendor.updateVendorById(id, data);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// delete Vendor +
const deleteVendorById = async (id) => {
  try {
    const dbResponse = await dbServices.Vendor.deleteVendorbyid(id);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

// upload vendor image to S3
const uploadToS3 = (file) => {
  const s3bucket = new AWS.S3({
    params: { Bucket: "content.ys.com/cs/images/vendor" },
  });
  const fileName = generateS3FileKey(file.originalname);
  const params = {
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, data) => {
      if (err) {
        // logger('Validate API Error - Upload vendor image to S3', err);
        console.log("vendor S3 upload error", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// upload vendor image to S3
const loginVendors = async (email, password) => {
  try {
    const dbResponse = await dbServices.Vendor.loginVendors(email);
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  createVendor,
  getVendorByid,
  getVendordata,
  getAllVendor,
  updateVendorById,
  deleteVendorById,
  uploadToS3,
  loginVendors,
};
