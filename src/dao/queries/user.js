const Signup = require('../queries/model/signup');

const createUser = (userBody) => Signup.create(userBody);
const getUserByPhone = (phone) => Signup.findOne({ phone: phone });
const getUserdata = (data) => Signup.find( {$or: [ {phone: data.phone }, { email: data.email } ]} );
const getAllUser = () => Signup.find();
const findUserUpdate = (id, data) => Signup.findByIdAndUpdate(id, data);
const deleteUser = (id) => Signup.findByIdAndDelete(id);


module.exports = {
    createUser,
    getUserByPhone,
    getUserdata,
    getAllUser,
    findUserUpdate,
    deleteUser,
};
