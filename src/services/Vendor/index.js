const { createVendor, getVendorByid, getAllVendor, updateVendorById, deleteVendorById, uploadToS3 } = require('../Vendor/function');
const { parseStringifiedNull } = require('../../parser/input');
const { parseFormData } = require('../../utils/utility_function');
const dotenv = require('dotenv');
dotenv.config('.env.local');
const bcrypt = require('bcrypt');
const IMAGE_BASE_CDN = process.env.IMAGE_BASE_CDN;
// GET category
const createVendors = async (req, res, next) => {
    try {
        let body = parseFormData(req.body);required: true
        body = body['form-data'];
        console.log('<<<<<<<<<<<<<---body=========>>>>>>>>>>>>>>', body);
        const file = req.files ? req.files[0] : null;
        console.log('-------------file ----====>>', file);
        if (file) {
            // this condition will executed if a Vendors photo has been uploaded
            const imageData = await uploadToS3(file);
            console.log('<<<<<<<<<<<<<---body=========>>>>>>>>>>>>>>', imageData);
            body.imagekey = imageData.Key;
            body.imagelocation = `${IMAGE_BASE_CDN}/${imageData.Key}`;
        }
        console.log('==========---->>  Password=========>>>>>>>>>>>>>>', body.password);
        encryptedPassword = await bcrypt.hash(body.password, 10);
        console.log('encryptedPassword=========>>>>>>>>>>>>>>', encryptedPassword);
        const options = {
            vendorName: body.vendorName,
            email: body.email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword
        };
        const vendor = await createVendor(options);
        res.status(201).json({ vendorDetails: vendor });
    } catch (err) {
        console.log(err);
    }
}

// retrieve and return all vendor/ retrive and return a single vendor
const getVendor = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getVendorByid(id)
            .then(async (vendor) => {
                try {
                    if (!vendor && vendor.id) {
                        res.status(404).json({ message: "Not found vendor with id " + id })
                    } else {
                        res.json(vendor)
                    }
                } catch (err) {
                    res.status(500).json({ message: "Error retrieving vendor with id " + id })
                }
            })
            .catch((err) => res.status(500).json(err));
    } else {
        getAllVendor()
            .then(vendor => {
                res.status(201).json({
                    data: vendor,
                    success: true,
                    message: null
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving vendor information" })
                next(err);
            })
    }
}
//*********************Pagination code for all data*******************************
//     limitPage = parseInt(req.query.limit, 10) || 10;
//     const pageChange = parseInt(req.query.page, 10) || 1;
//     Product.paginate({}, { limit: limitPage, page: pageChange }).populate('category')
//       .then((result) => {
//         return res.status(200).json({
//           message: "GET request to all getAllProducts",
//           dataCount: result.length,
//           result: result,
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).json({
//           error: err,
//         });
//       });
//   },


// retrive and return a single vendor
const FindOneVendor = async (req, res, next) => {
    const id = req.params.id;
    getCategoryByid(id)
        .then(async (vendor) => {
            try {
                if (!vendor && vendor.id) {
                    res.status(404).json({ message: "Not found vendor with id " + id })
                } else {
                    res.json(vendor)
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving vendor with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
}

// update vendor
const updateVendor = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await updateVendorById(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update vendor with ${id}. Maybe vendor not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update vendor information" })
        })
}

// delete vendor
const deleteVendor = async (req, res, next) => {
    const id = req.params.id;
    await deleteVendorById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "vendor was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete vendor with id=" + id
            });
        });
}

module.exports = {
    createVendors,
    getVendor,
    FindOneVendor,
    updateVendor,
    deleteVendor,
};
