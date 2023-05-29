const { createCategorys, getCategoryByid, getAllCategory, updateCategoryByid, deleteCategoryByid, getCategoryByName } = require('../Categories/functions');

// GET category
const createCategory = async (req, res, next) => {
    try {
        const body = req.body;
        const categoryName = await getCategoryByName(body.name);
        if (categoryName.length === 0) {
            // Validate Category input
            if (!(body.name && body.imagePath)) {
                res.status(404).json("Name and Image Required");
            }
            const options = {
                name: body.name,
                imagePath: body.imagePath
            };
            const category = await createCategorys(options);
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'This category has already been created' });
        }
    } catch (err) {
        return res.sendStatus(500).json({
			error: 'Failed to create Category',
			message: err.message,
		});
    }
};

// retrieve and return all Category/ retrive and return a single Category
const getCategory = async (req, res, next) => {
        getAllCategory().then(categories => {
            res.status(200).json({
                data: categories,
                success: true,
                message: "Categories found"
            });
        }).catch(err => {
            res.status(500).json({ message: err.message || "Error Occurred while retriving Category information" });
            next(err);
        });
};

// retrive and return a single Category
const FindOneCategory = async (req, res, next) => {
    const id = req.params.id;
    getCategoryByid(id).then(async category => {
        try {
            if (!category && category.id) {
                res.status(404).json({ message: "Not found category with id " + id });
            } else {
                res.status(200).json(category);
            }
        } catch (err) {
            res.status(500).json({ message: "Error retrieving category with id " + id });
        }
    }).catch(err => res.status(500).json(err));
};

// update Category
const updateCategory = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Data to update can not be empty" });
    }
    const id = req.params.id;
    if (!(id.match(/^[0-9a-fA-F]{24}$/))) {return res.status(500).json({message :'Invalid Category id.'})};
    await updateCategoryByid(id, data).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update Category with ${id}. Maybe Category not found!` });
        } else {
            res.status(200).json({ message: " Successfully Updated Category information" });
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update Category information" });
    });
};

const deleteCategory = async (req, res, next) => {
    const id = req.params.id;
    if (!(id.match(/^[0-9a-fA-F]{24}$/))) {return res.status(500).json({message :'Invalid Category id.'})};
    await deleteCategoryByid(id).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
        } else {
            res.status(200).json({
                message: "Category was deleted successfully!"
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: "Could not delete Category with id=" + id
        });
    });
};

module.exports = {
    createCategory,
    getCategory,
    FindOneCategory,
    updateCategory,
    deleteCategory
};