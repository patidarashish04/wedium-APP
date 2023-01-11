const dbServices = require('../../dao/queries/index');
// create Banner +
const createBanners = async (profile) => {
    try {
        const dbResponse = await dbServices.Banner.createBanner(profile);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};
// get Banner by id +
const getBannerByid = async (id) => {
    try {
        const dbResponse = await dbServices.Banner.getBannerByid(id);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};
// get All Banner +
const getAllBanner = async () => {
    try {
        const dbResponse = await dbServices.Banner.getAllBanner();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create Banner +
const updateBannerByid = async (id, data) => {
    try {
        const dbResponse = await dbServices.Banner.updateBannerByid(id, data);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};

// delete Banner +
const deleteBannerByid = async (id) => {
    try {
        const dbResponse = await dbServices.Banner.deleteBannerByid(id);
		return dbResponse;
	} catch (err) {
        throw new Error(err);
	}
};
module.exports = {
	createBanners,
	getBannerByid,
	getAllBanner,
	updateBannerByid,
	deleteBannerByid,
}; 
