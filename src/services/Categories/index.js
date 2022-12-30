const { createCategorys, getCategoryByid, getAllCategory, findByIdAndUpdate, findByIdAndDelete } = require('../Categories/functions')

// GET category
const createCategory = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate Category input
        if (!(body.category_name && body.category_image && body.category_banner_image)) {
            res.status(400).json("All input is required");
        }
        const category = await createCategorys(body);
        res.status(200).json(category);
    } catch (err) {
        console.log(err);
    }
}

// retrieve and return all Category/ retrive and return a single Category
const getCategory = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getCategoryByid(id)
            .then(async (category) => {
                try {
                    if (!category && category.id) {
                        res.status(404).json({ message: "Not found category with id " + id })
                    } else {
                        res.json(category)
                    }
                } catch(err) {
                res.status(500).json({ message: "Error retrieving category with id " + id })
                }
            })
            .catch((err) => res.status(500).json(err));
    } else {
        getAllCategory()
            .then(categories => {
                res.status(201).json({
                    success: true,
                    data: categories,
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving Category information" })
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


// retrive and return a single Category
const FindOneCategory = async (req, res, next) => {
    const id = req.params.id;
    getCategoryByid(id)
        .then(async (category) => {
            try {
                if (!category && category.id) {
                    res.status(404).json({ message: "Not found category with id " + id })
                } else {
                    res.json(category)
                }
            } catch(err) {
            res.status(500).json({ message: "Error retrieving category with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
    }

    // update Category
const updateCategory = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await findByIdAndUpdate(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update Category with ${id}. Maybe Category not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update Category information" })
        })
}

const deleteCategory = async (req, res, next) => {
    const id = req.params.id;
    await findByIdAndDelete(id)
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
    createCategory,
    getCategory,
    FindOneCategory,
    updateCategory,
    deleteCategory,
};
