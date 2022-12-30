const Registers = require('../queries/model/register');

const createUser = (userBody) => Registers.create(userBody);
const getUserByEmail = (email) => Registers.find({ email });
const getAllUser = () => Registers.find();
const findUserUpdate = (id, data) => Registers.findByIdAndUpdate(id, data);
const deleteUser = (id) => Registers.findByIdAndDelete(id);


module.exports = {
    createUser,
    getUserByEmail,
    getAllUser,
    findUserUpdate,
    deleteUser,
};
