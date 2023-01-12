// const Services = require('../../dao/queries/model/services');
const { getSubCategoryByid } = require('../SubCategories/functions');
const { createServices, getServicesByid, BestSeller, getAllServices, updateServicesById, deleteServicesById } = require('../Services/function');

// GET Services
const createNewServices = async (req, res, next) => {
    try {
        const id = req.body.subCatgoryId;
        const SubCategory = await getSubCategoryByid(id);
        if (!SubCategory) return res.status(400).send('SubCategory Not Found ');
        const body = req.body;
        // Validate services input
        if (!(body.subCatgoryId && body.name && body.image)) {
            res.status(400).json("All input is required");
        }
        const services = await createServices(body);
        res.status(200).json(services);
    } catch (err) {
        console.log(err);
    }
};

// retrieve and return all Services/ retrive and return a single Services
const getServices = async (req, res, next) => {
    if (req.query.subCatgoryId) {
        const id = req.query.subCatgoryId;
        getServicesByid(id).then(async Services => {
            try {
                if (!Services && Services.id) {
                    res.status(404).json({ message: "Not found Services with id " + id });
                } else {
                    res.json(Services);
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving Services with id " + id });
            }
        }).catch(err => res.status(500).json(err));
    } else {
        getAllServices().then(Services => {
            res.status(201).json({
                data: Services,
                success: true,
                message: null
            });
        }).catch(err => {
            res.status(500).json({ message: err.message || "Error Occurred while retriving Services information" });
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


const getBestSeller = async (req, res, next) => {
    BestSeller().then(Services => {
        res.status(201).json({
            data: Services,
            success: true,
            message: null
        });
    }).catch(err => {
        res.status(500).json({ message: err.message || "Error Occurred while retriving Services information" });
        next(err);
    });
};
// retrive and return a single Category
const FindOneServices = async (req, res, next) => {
    const id = req.params.id;
    getServicesByid(id).then(async Services => {
        try {
            if (!Services && Services.id) {
                res.status(404).json({ message: "Not found Services with id " + id });
            } else {
                res.json(Services);
            }
        } catch (err) {
            res.status(500).json({ message: "Error retrieving Services with id " + id });
        }
    }).catch(err => res.status(500).json(err));
};

// update Services
const updateServices = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Data to update can not be empty" });
    }
    const id = req.params.id;
    await updateServicesById(id, data).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update Services with ${id}. Maybe Services not found!` });
        } else {
            res.json(data);
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update Services information" });
    });
};
// delete services
const deleteServices = async (req, res, next) => {
    const id = req.params.id;
    await deleteServicesById(id).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
        } else {
            res.json({
                message: "Services was deleted successfully!"
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: "Could not delete Services with id=" + id
        });
    });
};

module.exports = {
    createNewServices,
    getServices,
    FindOneServices,
    updateServices,
    deleteServices,
    getBestSeller
};