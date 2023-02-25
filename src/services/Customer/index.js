const { createCustomers, getCustomerdata, getCustomerByid, getAllCustomer, updateCustomerByid, deleteCustomerByid, getCustomerByName } = require('../Customer/function');

// GET Customer
const createCustomer = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate Customer input
        if (!(body.fullName && body.email && body.phone)) {
            res.status(404).json("All Data Required");
        }
        const data = { phone: body.phone, email: body.email }
        // check if Customer already exist by phone
        const oldCustomerData = await getCustomerdata(data);
        if (!oldCustomerData) {
            res.status(404).json({ message: 'This Customer has already been created' });
        } else {
            const options = {
                name: body.name,
                email: body.email.toLowerCase(), // sanitize: convert email to lowercase
                phone: body.phone,
            };
            const Customer = await createCustomers(options);
            res.status(200).json(Customer);
        }
    } catch (err) {
        res.status(500).json({ message: "Error creating Customer" });
    }
};

// retrieve and return all Customer/ retrive and return a single Customer
const getCustomer = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getCustomerByid(id).then(async Customer => {
            try {
                if (!Customer && Customer.id) {
                    res.status(404).json({ message: "Not found Customer with id " + id });
                } else {
                    res.status(200).json(Customer);
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving Customer with id " + id });
            }
        }).catch(err => res.status(500).json(err));
    } else {
        getAllCustomer().then(categories => {
            res.status(200).json({
                data: categories,
                success: true,
                message: "Categories found"
            });
        }).catch(err => {
            res.status(500).json({ message: err.message || "Error Occurred while retriving Customer information" });
            next(err);
        });
    }
};
//*********************Pagination code for all data*******************************
//     limitPage = parseInt(req.query.limit, 10) || 10;
//     const pageChange = parseInt(req.query.page, 10) || 1;
//     Product.paginate({}, { limit: limitPage, page: pageChange }).populate('Customer')
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

// exports.displayProduct = async (req, res, next) => {
//     //enable pagination
//     const pageSize = 3;
//     const page = Number(req.query.pageNumber) || 1;
//     const count = await Product.find({}).estimatedDocumentCount();
//     //all categories ids
//     let ids = [];
//     const categ = await Customer.find({}, { _id: 1 });
//     categ.forEach(cat => {
//         ids.push(cat._id);
//     })
//     //filter
//     let cat = req.query.cat;
//     let query = cat !== '' ? cat : ids;
//     try {
//         const products = await Product.find({ Customer: query }).populate('Customer', 'name')
//             .skip(pageSize * (page - 1))
//             .limit(pageSize)
//         res.status(200).json({
//             success: true,
//             products,
//             page,
//             pages: Math.ceil(count / pageSize),
//             count
//         })
//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// }

// retrive and return a single Customer
const FindOneCustomer = async (req, res, next) => {
    const id = req.params.id;
    getCustomerByid(id).then(async Customer => {
        try {
            if (!Customer && Customer.id) {
                res.status(404).json({ message: "Not found Customer with id " + id });
            } else {
                res.status(200).json(Customer);
            }
        } catch (err) {
            res.status(500).json({ message: "Error retrieving Customer with id " + id });
        }
    }).catch(err => res.status(500).json(err));
};

// update Customer
const updateCustomer = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Data to update can not be empty" });
    }
    const id = req.params.id;
    await updateCustomerByid(id, data).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update Customer with ${id}. Maybe Customer not found!` });
        } else {
            res.status(200).json({ message: " Successfully Updated Customer information" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update Customer information" });
    });
};

const deleteCustomer = async (req, res, next) => {
    const id = req.params.id;
    await deleteCustomerByid(id).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
        } else {
            res.status(200).json({
                message: "Customer was deleted successfully!"
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: "Could not delete Customer with id=" + id
        });
    });
};

module.exports = {
    createCustomer,
    getCustomer,
    FindOneCustomer,
    updateCustomer,
    deleteCustomer
};