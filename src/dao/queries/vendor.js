const Vendor = require("../queries/model/vendor");

const createVendor = (vendorBody) => Vendor.create(vendorBody);
const getVendordata = (data) =>
  Vendor.find({ $or: [{ phone: data.phone }, { email: data.email }] });
const getVendorByid = (id) => Vendor.findById(id);
const getAllVendor = () => Vendor.find();
const updateVendorById = (id, data) => Vendor.findByIdAndUpdate(id, data);
const deleteVendorbyid = (id) => Vendor.findByIdAndDelete(id);
// const loginVendors = (email, password) => {
//   return Vendor.findOne({ $and: [{ email: email }, { password: password }] });
// };
const loginVendors = (email) => {
  return Vendor.findOne({ email: email });
};

module.exports = {
  createVendor,
  getVendordata,
  getVendorByid,
  getAllVendor,
  updateVendorById,
  deleteVendorbyid,
  loginVendors,
};
