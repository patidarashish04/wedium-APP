const Services = require('../../dao/queries/model/services');
// const { getmyname,} = require('./functions');

// GET category

const createServices = async (req, res, next) => {
	try {
        const { SubCategory_id, service_name, service_images, service_banner_image, service_description, notes, price } = req.body;
        // Validate user input
        if (!(SubCategory_id && service_name && service_images, service_banner_image, price)) {
            res.status(400).json("All input is required");
        }
        const services = await Services.create({
            SubCategory_id,
            service_name,
            service_images,
            service_banner_image,
            service_description,
            notes,
            price
        });
        res.status(200).json(services);
    } catch (err) {
        console.log(err);
    }
}
// retrieve and return all users/ retrive and return a single user
	const getServices = async (req, res, next) => {
   if (req.query.id) {
	   const id = req.params.id;
	   Services.findById(id)
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
	Services.find()
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

const FindOneServices = async (req, res, next) => {
    const id = req.params.id;
    Services.findById(id)
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

const updateServices = async (req, res, next) => {
	if (!req.body) {
		return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    Services.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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

const deleteServices = async (req, res, next) => {
    const id = req.params.id;
    Services.findByIdAndDelete(id)
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
	createServices,
	getServices,
	FindOneServices,
	updateServices,
	deleteServices
};
