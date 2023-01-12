const dbServices = require('../../dao/queries/index');
const AWS = require('aws-sdk');
const { generateS3FileKey } = require('../../utils/s3Utils');
// create category +
const createVendor = async vendor => {
	try {
		const dbResponse = await dbServices.Vendor.createVendor(vendor);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get category by id +
const getVendorByid = async id => {
	try {
		const dbResponse = await dbServices.Vendor.getVendorByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All category +
const getAllVendor = async () => {
	try {
		const dbResponse = await dbServices.Vendor.getAllVendor();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create category +
const updateVendorById = async (id, data) => {
	try {
		const dbResponse = await dbServices.Vendor.updateVendorById(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete category +
const deleteVendorById = async id => {
	try {
		const dbResponse = await dbServices.Vendor.deleteVendorbyid(id);
		console.log('==========dbResponse========>>>>>', dbResponse);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// upload vendor image to S3
const uploadToS3 = file => {
	const s3bucket = new AWS.S3({ params: { Bucket: 'content.ys.com/cs/images/vendor' } });
	const fileName = generateS3FileKey(file.originalname);
	const params = {
		Key: fileName,
		Body: file.buffer,
		ContentType: file.mimetype
	};
	return new Promise((resolve, reject) => {
		s3bucket.upload(params, (err, data) => {
			if (err) {
				// logger('Validate API Error - Upload vendor image to S3', err);
				console.log('vendor S3 upload error', err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

module.exports = {
	createVendor,
	getVendorByid,
	getAllVendor,
	updateVendorById,
	deleteVendorById,
	uploadToS3
};