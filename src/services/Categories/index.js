const { createCategorys, getCategoryByid, getAllCategory, updateCategoryByid, deleteCategoryByid, getCategoryByName } = require('../Categories/functions')

// GET category
const createCategory = async (req, res, next) => {
    try {
        const body = req.body;  
        const categoryName = await getCategoryByName(body.name);
        if ( categoryName.length === 0) {
                    // Validate Category input
                    if (!(body.name && body.imagePath)) {
                        res.status(400).json("All input is required");
                    }
                    const options = {
                        name: body.name,
                        imagePath: body.imagePath,
                    };
                    const category = await createCategorys(options);
                    res.status(200).json(category);

                } else {
                    res.status(404).json({ message: 'This category has already been created' })
                }
    } catch (err) {
        res.status(500).json({ message: "Error creating category" })
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
                    } catch (err) {
                        res.status(500).json({ message: "Error retrieving category with id " + id })
                    }
                })
                .catch((err) => res.status(500).json(err));
        } else {
            getAllCategory()
                .then(categories => {
                    res.status(200).json({
                        data: categories,
                        success: true,
                        message: "Categories found"
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

    // exports.displayProduct = async (req, res, next) => {
    //     //enable pagination
    //     const pageSize = 3;
    //     const page = Number(req.query.pageNumber) || 1;
    //     const count = await Product.find({}).estimatedDocumentCount();
    //     //all categories ids
    //     let ids = [];
    //     const categ = await Category.find({}, { _id: 1 });
    //     categ.forEach(cat => {
    //         ids.push(cat._id);
    //     })
    //     //filter
    //     let cat = req.query.cat;
    //     let query = cat !== '' ? cat : ids;
    //     try {
    //         const products = await Product.find({ category: query }).populate('category', 'name')
    //             .skip(pageSize * (page - 1))
    //             .limit(pageSize)
    //         res.status(201).json({
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
                } catch (err) {
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
        await updateCategoryByid(id, data)
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
        await deleteCategoryByid(id)
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
