const Signup = require('../queries/model/signup');
const Message = require('../../dao/queries/model/messgae');


const createUser = (userBody) => Signup.create(userBody);
const getUserByPhone = (phone) => Signup.findOne({ phone: phone });
const getOTPByPhone = (phone) => Message.findOne({ phoneNumber: phone });
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
    getOTPByPhone,
};
