const SubCategory = require('../../dao/queries/model/subCategory');
const { getmyname,} = require('./functions');

// GET category

const createSubCategory = async (req, res, next) => {
	try {
        const { category_id, sub_category_name, sub_category_image } = req.body;
        // Validate user input
        if (!(category_id && sub_category_name && sub_category_image)) {
            res.status(400).json("All input is required");
        }
        const subcategory = await SubCategory.create({
            category_id,
            sub_category_name,
            sub_category_image
        });
        res.status(200).json(subcategory);
    } catch (err) {
        console.log(err);
    }
}
// retrieve and return all users/ retrive and return a single user
	const getSubCategory = async (req, res, next) => {
   if (req.query.id) {
	   const id = req.query.id;
	   SubCategory.findById(id)
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
	SubCategory.find()
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

// retrive and return a single user

const FindOneSubCategory = async (req, res, next) => {
    const id = req.params.id;
    SubCategory.findById(id)
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

const updateSubCategory = async (req, res, next) => {
	if (!req.body) {
		return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    SubCategory.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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

const deleteSubCategory = async (req, res, next) => {
    const id = req.params.id;
    SubCategory.findByIdAndDelete(id)
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
	createSubCategory,
	getSubCategory,
	FindOneSubCategory,
	updateSubCategory,
	deleteSubCategory
};
