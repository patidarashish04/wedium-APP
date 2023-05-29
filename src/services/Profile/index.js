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

// retrieve and return all Profiles
const getProfile = async (req, res, next) => {
        getAllProfile()
            .then(categories => {
                res.status(200).json({
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

// delete profile
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
