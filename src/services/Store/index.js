const { getVendorByid } = require('../Vendor/function');
const { getCityByid } = require('../City/function');
const { createStore, getStoreByid, getAllStore, updateStoreById, deleteStoreById } = require('../Store/function');

// create store
const createStores = async (req, res) => {
    try {
        const body = req.body;
        const id = req.body.vendorId;
        const cityId = req.body.cityId
        if (!(id.match(/^[0-9a-fA-F]{24}$/))) {return res.status(500).json({message :'Invalid vendor id.'})};
        if (!(cityId.match(/^[0-9a-fA-F]{24}$/))) {return res.status(500).json({message :'Invalid city id.'})};
        const cities = await getCityByid(cityId);
        if (!cities) return res.status(404).json({message : 'City not Found '});
        const vendor = await getVendorByid(id);
        // Create Store in our database
        body.vendorData = vendor;
        const Store = await createStore(body);
        res.status(200).json({ StoreDetails: Store });
    } catch (err) {
        res.status(500).json({ message: "Error creating Store" });
    }
}

// retrieve and return all Store/ retrive and return a single Store
const getStore = async (req, res, next) => {
    if (req.query.id) {
        const id = req.query.id;
        if (!(id.match(/^[0-9a-fA-F]{24}$/))) { return res.status(500).json({ message: 'Invalid Category id.' }) };
        getStoreByid(id)
            .then(async (Store) => {
                try {
                    if (!Store && Store.id) {
                        res.status(404).json({ message: "Not found Store with id " + id })
                    } else {
                        res.status(200).json(Store)
                    }
                } catch (err) {
                    res.status(500).json({ message: "Error retrieving Store with id " + id })
                }
            })
            .catch((err) => res.status(500).json(err));
    } else {
        getAllStore()
            .then(Store => {
                res.status(200).json({
                    data: Store,
                    success: true,
                    message: null
                })
            })
            .catch(err => {
                res.status(500).json({ message: err.message || "Error Occurred while retriving Store information" })
                next(err);
            })
    }
}

// retrive and return a single Store
const FindOneStore = async (req, res, next) => {
    const id = req.params.id;
    if (!(id.match(/^[0-9a-fA-F]{24}$/))) { return res.status(500).json({ message: 'Invalid Category id.' }) };
    getStoreByid(id)
        .then(async (Store) => {
            try {
                if (!Store && Store.id) {
                    res.status(404).json({ message: "Not found Store with id " + id })
                } else {
                    res.status(200).json(Store)
                }
            } catch (err) {
                res.status(500).json({ message: "Error retrieving Store with id " + id })
            }
        })
        .catch((err) => res.status(500).json(err));
}

// update Store
const updateStore = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    if (!(id.match(/^[0-9a-fA-F]{24}$/))) { return res.status(500).json({ message: 'Invalid Category id.' }) };
    await updateStoreById(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update Store with ${id}. Maybe Store not found!` })
            } else {
                res.status(200).json({ message: " Successfully Updated Store information" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update Store information" })
        })
}

// delete Store
const deleteStore = async (req, res, next) => {
    const id = req.params.id;
    if (!(id.match(/^[0-9a-fA-F]{24}$/))) { return res.status(500).json({ message: 'Invalid Category id.' }) };
    await deleteStoreById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.status(200).json({
                    message: "Store was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete Store with id=" + id
            });
        });
}

module.exports = {
    createStores,
    getStore,
    FindOneStore,
    updateStore,
    deleteStore,
};
