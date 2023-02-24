const { getCategoryByid } = require('../Categories/functions');
const { createSubCategory, getSubCategoryByid, getAllSubCategory, updateSubCategoryById, deleteSubCategoryById, getSubCategoryByName } = require('../SubCategories/functions');

// GET SubCategory
const createNewSubCategory = async (req, res, next) => {
    try {
        const body = req.body;
        const id = req.body.categoryId;
        const categories = await getCategoryByid(id);
        if (categories == null) res.status(500).json('Invalid category id.');
        if (!categories) return res.status(404).json({message : 'Category Not Found '});
        const subCategoryName = await getSubCategoryByName(body.name);
        if (subCategoryName.length === 0) {
            // Validate user input
            if (!(body.categoryId && body.name && body.imagePath)) {
                res.status(404).json("All input is required");
            }
            const SubCategory = await createSubCategory(body);
            res.status(200).json(SubCategory);
        } else {
            res.status(404).json({ message: 'This SubCategory has already been created' });
        }
    } catch (err) {
        console.log(err);
    }
};

function CreateSubCategory(categories, categoryId = null) {
    const categoryList = [];
    let category;
    if (categoryId == null) {
        categories.filter(cat => cat.categoryId == undefined);
    } else {
        category = categories.filter(cat => cat.categoryId === categoryId);
    }
    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate._name,
            slug: cate.slug,
            children: createCategories(categories.cate._id)
        });
    }
    return categoryList;
}

// exports.addCategory = (req, res) => {
//     const categoryObj = {
//         name: req.body.name,
//         slug: slugify(req.body.name),
//     };
//     if (req.body.category_id) {
//         categoryObj.category_id = req.body.category_id;
//     }
//     const cat = new Category(categoryObj);
//     cat.save((error, category) => {
//         if (error) return res.status(400).json({ error });
//         if (category) {
//             return res.status(200).json({ category });
//         }
//     });
// };

// exports.getCategories = (req, res) => {
//     Category.find({}).exec((error, categories) => {
//         if (error) console.log(error);
//         if (categories) {
//             const categoryList = createCategories(categories);
//             res.status(200).json({ categoryList });
//         }
//         if (categories) {
//             res.status(200).json({ categories });
//         }
//     });
// };


// retrieve and return all SubCategory/ retrive and return a single SubCategory
const getSubCategory = async (req, res, next) => {
    if (req.query.categoryId) {
        const id = req.query.categoryId;
        getSubCategoryByid(id).then(async SubCategory => {
            try {
                if (!SubCategory && SubCategory.id) {
                    res.status(404).json({ message: "Not found SubCategory with id " + id });
                } else {
                    res.status(200).json(SubCategory);
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving SubCategory with id " + id });
            }
        }).catch(err => res.status(500).json(err));
    } else {
        getAllSubCategory().then(SubCategory => {
            res.status(200).json({
                data: SubCategory,
                success: true,
                message: null
            });
        }).catch(err => {
            res.status(500).json({ message: err.message || "Error Occurred while retriving SubCategory information" });
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


// retrive and return a single SubCategory
const FindOneSubCategory = async (req, res, next) => {
    const id = req.params.id;
    getSubCategoryByid(id).then(async SubCategory => {
        try {
            if (!SubCategory && SubCategory.id) {
                res.status(404).json({ message: "Not found SubCategory with id " + id });
            } else {
                res.status(200).json(SubCategory);
            }
        } catch (err) {
            res.status(500).json({ message: "Error retrieving SubCategory with id " + id });
        }
    }).catch(err => res.status(500).json(err));
};

// update SubCategory
const updateSubCategory = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Data to update can not be empty" });
    }
    const id = req.params.id;
    await updateSubCategoryById(id, data).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update SubCategory with ${id}. Maybe SubCategory not found!` });
        } else {
            res.status(200).json({ message: " Successfully Updated SubCategory information" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update SubCategory information" });
    });
};

//delete subCategory
const deleteSubCategory = async (req, res, next) => {
    const id = req.params.id;
    await deleteSubCategoryById(id).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
        } else {
            res.json({
                message: "SubCategory was deleted successfully!"
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: "Could not delete SubCategory with id=" + id
        });
    });
};

module.exports = {
    createNewSubCategory,
    CreateSubCategory,
    getSubCategory,
    FindOneSubCategory,
    updateSubCategory,
    deleteSubCategory
};