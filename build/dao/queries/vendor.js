const Vendor = require('../queries/model/vendor');

const createVendor = vendorBody => Vendor.create(vendorBody);
const getVendorByid = id => Vendor.findById(id);
const getAllVendor = () => Vendor.find();
const updateVendorById = (id, data) => Vendor.findByIdAndUpdate(id, data);
const deleteVendorbyid = id => Vendor.findByIdAndDelete(id);

module.exports = {
    createVendor,
    getVendorByid,
    getAllVendor,
    updateVendorById,
    deleteVendorbyid
};