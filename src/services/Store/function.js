const dbServices = require('../../dao/queries/index');
// create Store +
const createStore = async (Store) => {
	try {
		const dbResponse = await dbServices.Store.createStore(Store);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get Store by id +
const getStoreByid = async (id) => {
	try {
		const dbResponse = await dbServices.Store.getStoreByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get Store  +
const getStoredata = async (data) => {
	try {
		const dbResponse = await dbServices.Store.getStoredata(data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get All Store +
const getAllStore = async () => {
	try {
		const dbResponse = await dbServices.Store.getAllStore();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create Store +
const updateStoreById = async (id, data) => {
	try {
		const dbResponse = await dbServices.Store.updateStoreById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete Store +
const deleteStoreById = async (id) => {
	try {
		const dbResponse = await dbServices.Store.deleteStorebyid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// upload Store image to S3
const uploadToS3 = (file) => {
	const s3bucket = new AWS.S3({ params: { Bucket: 'content.ys.com/cs/images/Store' } });
	const fileName = generateS3FileKey(file.originalname);
	const params = {
		Key: fileName,
		Body: file.buffer,
		ContentType: file.mimetype,
	};
	return new Promise((resolve, reject) => {
		s3bucket.upload(params, (err, data) => {
			if (err) {
				// logger('Validate API Error - Upload Store image to S3', err);
				console.log('Store S3 upload error', err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

module.exports = {
	createStore,
	getStoreByid,
	getStoredata,
	getAllStore,
	updateStoreById,
	deleteStoreById,
	uploadToS3
}; 
