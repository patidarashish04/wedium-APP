const { createOrders, getOrderByid, getAllOrder, updateOrderById, deleteOrderById } = require('../Order/function');

// GET Order
const createNewOrder = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate Order input
        if (!(body.userName && body.serviceName && body.cityName)) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }
        const Order = await createOrders(body);
        res.status(200).json(Order);
    } catch (err) {
        console.log(err);
    }
};
// retrieve and return all Order/ retrive and return a single Order
const getOrderList = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getOrderByid(id).then(async category => {
            try {
                if (!category && category.id) {
                    res.status(404).json({ message: "Not found Order with id " + id });
                } else {
                    res.json(category);
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving Order with id " + id });
            }
        }).catch(err => res.status(500).json(err));
    } else {
        getAllOrder().then(Order => {
            res.status(201).json({
                data: Order,
                success: true,
                message: null
            });
        }).catch(err => {
            res.status(500).json({ message: err.message || "Error Occurred while retriving Order information" });
            next(err);
        });
    }
};
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


// retrive and return a single Order
const getSingleOrder = async (req, res, next) => {
    const id = req.params.id;
    getOrderByid(id).then(async category => {
        try {
            if (!category && category.id) {
                res.status(404).json({ message: "Not found Order with id " + id });
            } else {
                res.json(category);
            }
        } catch (err) {
            res.status(500).json({ message: "Error retrieving Order with id " + id });
        }
    }).catch(err => res.status(500).json(err));
};

// update Order
const updateOrder = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Data to update can not be empty" });
    }
    const id = req.params.id;
    await updateOrderById(id, data).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update Order with ${id}. Maybe Order not found!` });
        } else {
            res.json(data);
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update Order information" });
    });
};

// delete Order
const deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    await deleteOrderById(id).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
        } else {
            res.json({
                message: "Order was deleted successfully!"
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: "Could not delete Order with id=" + id
        });
    });
};

module.exports = {
    createNewOrder,
    getOrderList,
    getSingleOrder,
    updateOrder,
    deleteOrder
};