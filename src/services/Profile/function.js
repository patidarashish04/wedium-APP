const dbServices = require('../../dao/queries/index');
// create Profile +
const createProfile = async (profile) => {
    try {
        const dbResponse = await dbServices.Profile.createProfile(profile);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};
// get Profile by id +
const getProfileByid = async (id) => {
    try {
        const dbResponse = await dbServices.Profile.getProfileByid(id);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};
// get All Profile +
const getAllProfile = async () => {
    try {
        const dbResponse = await dbServices.Profile.getAllProfile();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// update Profile +
const updateProfileByid = async (id, data) => {
    try {
        const dbResponse = await dbServices.Profile.updateProfileByid(id, data);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};

// delete Profile +
const deleteProfileByid = async (id) => {
    try {
        const dbResponse = await dbServices.Profile.deleteProfileByid(id);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};
module.exports = {
	createProfile,
	getProfileByid,
	getAllProfile,
	updateProfileByid,
	deleteProfileByid,
}; 
