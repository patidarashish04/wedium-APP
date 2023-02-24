const { createProfile, getProfileByid, getAllProfile, updateProfileByid, deleteProfileByid } = require('../Profile/function')

//  create Profiles
const createProfiles = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate profile input
        if (!(body.fullName && body.phoneNumber && body.coverImage)) {
            res.status(404).json("All input is required");
        }
        const profile = await createProfile(body);
        res.status(200).json(profile);
    } catch (err) {
        console.log(err);
    }
}

// retrieve and return all Profiles/ retrive and return a single Profiles
const getProfile = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        getProfilesByid(id)
            .then(async (profile) => {
                try {
                    if (!profile && profile.id) {
                        res.status(404).json({ message: "Not found profile with id " + id })
                    } else {
                        res.json(profile)
                    }
                } catch (err) {
                    res.status(500).json({ message: "Error retrieving profile with id " + id })
                }
            })
            .catch((err) => res.status(500).json(err));
    } else {
        getAllProfile()
            .then(categories => {
                res.status(201).json({
                    data: categories,
                    status: true,
                    message: null
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving profile information" })
                next(err);
            })
    }
}
//*********************Pagination code for all data*******************************
//     limitPage = parseInt(req.query.limit, 10) || 10;
//     const pageChange = parseInt(req.query.page, 10) || 1;
//     Product.paginate({}, { limit: limitPage, page: pageChange }).populate('profile')
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


// retrive and return a single profile
const FindOneProfile = async (req, res, next) => {
    const id = req.params.id;
    getProfileByid(id)
        .then(async (profile) => {
            try {
                if (!profile && profile.id) {
                    res.status(404).json({ message: "Not found profile with id " + id })
                } else {
                    res.json(profile)
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving profile with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
}

// update profile
const updateProfile = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await updateProfileByid(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update profile with ${id}. Maybe profile not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update profile information" })
        })
}

const deleteProfile = async (req, res, next) => {
    const id = req.params.id;
    await deleteProfileByid(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "profile was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete profile with id=" + id
            });
        });
}

module.exports = {
    createProfiles,
    getProfile,
    FindOneProfile,
    updateProfile,
    deleteProfile,
};
