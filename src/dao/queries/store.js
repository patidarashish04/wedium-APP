const Store = require('../queries/model/store');

const createStore = (StoreBody) => Store.create(StoreBody);
const getStoredata = (data) => Store.find( {$or: [ {phone: data.phone }, { email: data.email } ]} );
const getStoreByid = (id) => Store.findById(id);
const getAllStore = () => Store.find();
const updateStoreById = (id, data) => Store.findByIdAndUpdate(id, data);
const deleteStorebyid = (id) => Store.findByIdAndDelete(id);


module.exports = {
    createStore,
    getStoredata,
    getStoreByid,
    getAllStore,
    updateStoreById,
    deleteStorebyid,
};
