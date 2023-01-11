const Profile = require('../queries/model/profile');

const createProfile = (profileBody) => Profile.create(profileBody);
const getProfileByid = (id) => Profile.findById(id);
const getAllProfile = () => Profile.find();
const updateProfileByid = (id, data) => Profile.findByIdAndUpdate(id, data);
const deleteProfileByid = (id) => Profile.findByIdAndDelete(id);


module.exports = {
    createProfile,
    getProfileByid,
    getAllProfile,
    updateProfileByid,
    deleteProfileByid,
};