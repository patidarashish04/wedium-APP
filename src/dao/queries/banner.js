const Banner = require('../queries/model/banner');

const createBanner = (BannerBody) => Banner.create(BannerBody);
const getBannerByid = (id) => Banner.findById(id);
const getAllBanner = () => Banner.find();
const updateBannerByid = (id, data) => Banner.findByIdAndUpdate(id, data);
const deleteBannerByid = (id) => Banner.findByIdAndDelete(id);


module.exports = {
    createBanner,
    getBannerByid,
    getAllBanner,
    updateBannerByid,
    deleteBannerByid,
};