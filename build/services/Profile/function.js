const dbServices = require('../../dao/queries/index');
// create category +
const createProfile = async profile => {
				try {
								const dbResponse = await dbServices.Profile.createProfile(profile);
								return dbResponse;
				} catch (err) {
								throw new Error(err);
				}
};
// get category by id +
const getProfileByid = async id => {
				try {
								const dbResponse = await dbServices.Profile.getProfileByid(id);
								return dbResponse;
				} catch (err) {
								throw new Error(err);
				}
};
// get All category +
const getAllProfile = async () => {
				try {
								const dbResponse = await dbServices.Profile.getAllProfile();
								return dbResponse;
				} catch (err) {
								throw new Error(err);
				}
};
// create category +
const updateProfileByid = async (id, data) => {
				try {
								const dbResponse = await dbServices.Profile.updateProfileByid(id, data);
								return dbResponse;
				} catch (err) {
								throw new Error(err);
				}
};

// delete category +
const deleteProfileByid = async id => {
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
				deleteProfileByid
};