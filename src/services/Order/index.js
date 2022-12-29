const Order = require('../../dao/queries/model/order');
const { getmyname,} = require('./function');

// GET category
const createOrder = async (req, res, next) => {
	try {
        const { userName, serviceName, cityName } = req.body;
        // Validate user input
        if (!(userName && serviceName && cityName)) {
            return res.status(404).json({
				error: 'Category not found',
			});
        }
        const category = await Order.create({
            category_name,
            category_image,
            category_banner_image
        });
        res.status(200).json(category);
    } catch (err) {
        console.log(err);
    }
}
// retrieve and return all users/ retrive and return a single user
	const getOrderList = async (req, res, next) => {
   if (req.query.id) {
	   const id = req.query.id;
	   Order.findById(id)
		   .then(data => {
			   if (!data) {
				   res.status(404).json({ message: "Not found user with id " + id })
			   } else {
				   res.json(data)
			   }
		   })
		   .catch(err => {
			   res.status(500).json({ message: "Erro retrieving user with id " + id })
		   })
   } else {
	Order.find()
		   .then(user => {
			   res.status(201).json({
				   success: true,
				   data: user,
			   })
		   })
		   .catch(err => {
			   res.status(500).json({ message: err.message || "Error Occurred while retriving user information" })
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


// retrive and return a single user

const getSingleOrder = async (req, res, next) => {
    const id = req.params.id;
    Order.findById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: "Not found user with id " + id })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Erro retrieving user with id " + id })
        })
}

const updateOrder = async (req, res, next) => {
	if (!req.body) {
		return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    Order.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
	.then(data => {
		if (!data) {
			res.status(404).json({ message: `Cannot Update Category with ${id}. Maybe user not found!` })
		} else {
			res.json(data)
		}
	})
        .catch(err => {
            res.status(500).json({ message: "Error Update Category information" })
        })
}

const deleteOrder = async (req, res, next) => {
    const id = req.params.id;
    Order.findByIdAndDelete(id)
    .then(data => {
        if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "Category was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete Category with id=" + id
            });
        });
}


module.exports = {
	createOrder,
	getOrderList,
	getSingleOrder,
	updateOrder,
	deleteOrder
};
