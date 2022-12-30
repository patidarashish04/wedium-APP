const { createSubCategory, getSubCategoryByid, getAllSubCategory, updateSubCategoryById, deleteSubCategoryById } = require('../SubCategories/functions')

// GET SubCategory
const createNewSubCategory = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate user input
        if (!(body.category_id && body.sub_category_name && body.sub_category_image)) {
            res.status(400).json("All input is required");
        }
        const SubCategory = await createSubCategory(body);
        res.status(200).json(SubCategory);
    } catch (err) {
        console.log(err);
    }
}
// retrieve and return all SubCategory/ retrive and return a single SubCategory
const getSubCategory = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getSubCategoryByid(id)
            .then(async (SubCategory) => {
                try {
                    if (!SubCategory && SubCategory.id) {
                        res.status(404).json({ message: "Not found SubCategory with id " + id })
                    } else {
                        res.json(SubCategory)
                    }
                } catch (err) {
                    res.status(500).json({ message: "Error retrieving SubCategory with id " + id })
                }
            })
            .catch((err) => res.status(500).json(err));
    } else {
        getAllSubCategory()
            .then(SubCategory => {
                res.status(201).json({
                    success: true,
                    data: SubCategory,
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving SubCategory information" })
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


// retrive and return a single SubCategory
const FindOneSubCategory = async (req, res, next) => {
    const id = req.params.id;
    getSubCategoryByid(id)
        .then(async (SubCategory) => {
            try {
                if (!SubCategory && SubCategory.id) {
                    res.status(404).json({ message: "Not found SubCategory with id " + id })
                } else {
                    res.json(SubCategory)
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving SubCategory with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
}

// update SubCategory
const updateSubCategory = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await updateSubCategoryById(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update SubCategory with ${id}. Maybe SubCategory not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update SubCategory information" })
        })
}

//delete subCategory
const deleteSubCategory = async (req, res, next) => {
    const id = req.params.id;
    await deleteSubCategoryById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "SubCategory was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete SubCategory with id=" + id
            });
        });
}


module.exports = {
    createNewSubCategory,
    getSubCategory,
    FindOneSubCategory,
    updateSubCategory,
    deleteSubCategory
};
