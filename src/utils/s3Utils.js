const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'ap-southeast-1', signatureVersion: 'v4' });

// upload award image to S3 +
const uploadToS3 = (file, topic) => {
	const s3bucket = new AWS.S3({ params: { Bucket: `content.ys.com/cs/images/${topic}` } });
	const fileName = generateS3FileKey(file.originalname);
	const params = {
		Key: fileName,
		Body: file.buffer,
		ContentType: file.mimetype,
	};
	return new Promise((resolve, reject) => {
		s3bucket.upload(params, (err, data) => {
			if (err) {
				logger.error(`${topic} API Error - Upload ${topic} images to S3`, err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

const generateS3FileKey = (name) => {
	const timestamp = new Date().getTime();
	const nameArray = name.split('.');
	const originalName = nameArray[0];
	const fileExt = nameArray[nameArray.length - 1];
	const fileName = `${originalName}-${timestamp}.${fileExt}`.replace(/[^A-Z0-9.-]/ig, '').replace(/%20/g, '_');
	return fileName;
};

module.exports = {
	generateS3FileKey,
	uploadToS3,
};