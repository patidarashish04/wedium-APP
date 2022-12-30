import logger from './logger';

const AWS = require('aws-sdk');

const s3 = new AWS.S3({ region: 'ap-southeast-1', signatureVersion: 'v4' });
const fileType = require('file-type');

function getSignedPutUrlOfS3(fileName, fileType, extension) {
	const Bucket = 'meta.yourstory.com';
	const Key = `videos/${fileName}.${extension}`;
	const Expires = (12 * 60 * 60); // 12 hours in seconds;
	const ACL = 'bucket-owner-full-control';

	return new Promise((resolve) => {
		s3.getSignedUrl('putObject', {
			Bucket, Key, Expires, ContentType: fileType, ACL,
		}, (err, url) => {
			if (err) {
				logger.error(`Unable to obtain signed put URL for bucket: [${Bucket}], key: [${Key}]`, err);
				return resolve(null);
			}
			return resolve(url);
		});
	});
}

function getSignedGetUrlOfS3(Bucket, Key, Expires) {
	return new Promise((resolve) => {
		s3.getSignedUrl('getObject', { Bucket, Key, Expires }, (err, url) => {
			if (err) {
				logger.error(`Unable to obtain signed get URL for bucket: [${Bucket}], key: [${Key}]`, err);
				return resolve(null);
			}
			return resolve(url);
		});
	});
}

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

// delete award image from S3 +
const deleteFromS3 = (imageKey, topic) => {
	const s3bucket = new AWS.S3();
	const params = {
		Bucket: 'content.ys.com',
		Key: imageKey,
	};
	return new Promise((resolve, reject) => {
		s3bucket.deleteObject(params, (err) => {
			if (err) {
				logger.error(`${topic} API Error - Delete ${topic} images from S3`, err);
				reject(err);
			} else {
				resolve();
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

// upload base64 image to S3 +
const base64UploadToS3 = async (base64Url, topic, slug) => {
	const base64Data = Buffer.from(base64Url.replace(/^data:image\/\w+;base64,/, ''), 'base64');
	const mimeInfo = await fileType.fromBuffer(base64Data);
	const s3bucket = new AWS.S3({ params: { Bucket: `content.ys.com/cs/images/${topic}` } });
	const timeStamp = new Date().getTime();
	const fileName = `${slug}_${timeStamp}.${mimeInfo.ext}`;
	const params = {
		Key: fileName,
		Body: base64Data,
		ContentEncoding: 'base64',
		ContentType: `image/${mimeInfo.ext}`,
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

// upload base64 image to S3 for users +
const base64UploadToS3ForUsers = async ({
	base64Url, topic, slug, folderName = 'images', type,
}) => {
	const base64Data = Buffer.from(base64Url.replace(/^data:image\/\w+;base64,/, ''), 'base64');
	const mimeInfo = await fileType.fromBuffer(base64Data);
	const s3bucket = new AWS.S3({ params: { Bucket: `content.ys.com/cs/${folderName}/${topic}` } });
	const timeStamp = new Date().getTime();
	const fileName = `${slug}_${timeStamp}.${mimeInfo.ext}`;
	const params = {
		Key: fileName,
		Body: base64Data,
		ContentEncoding: 'base64',
		ContentType: `image/${mimeInfo.ext}`,
	};
	return new Promise((resolve, reject) => {
		s3bucket.upload(params, (err, data) => {
			if (err) {
				logger.error(`${type || topic} API Error - Upload ${topic} images to S3`, err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

module.exports = {
	getSignedPutUrlOfS3,
	getSignedGetUrlOfS3,
	deleteFromS3,
	uploadToS3,
	generateS3FileKey,
	base64UploadToS3,
	base64UploadToS3ForUsers,
};
