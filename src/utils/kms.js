// let { config, filePath } = require('./config.json');
// let AWS = require('aws-sdk');
import AWS from 'aws-sdk';

const fs = require('fs');

const kms = new AWS.KMS({ region: 'us-east-1' });

const decryptCredentials = () => new Promise((resolve, reject) => {
	const enc_ssn_n = fs.readFileSync(process.env.APP_CREDENTIALS_PATH);
	const encryptedParams = {
		CiphertextBlob: Buffer.from(enc_ssn_n, 'base64'),
	};
	kms.decrypt(encryptedParams, (err, decrypteddata) => {
		if (err) {
			console.log(err, err.stack);
			reject(err);
		} else {
			const config = JSON.parse(decrypteddata.Plaintext.toString());
			console.log(`App started with config for [${process.env.APP_ENV}]`);
			if (process.env.LOG_LEVEL === 'VERBOSE') {
				console.log('=====================================');
				console.log('Server started with the configuration');
				console.log(config);
				console.log('And Environment Variables');
				console.log('process.env.APP_CREDENTIALS_PATH =>', process.env.APP_CREDENTIALS_PATH);
				console.log('process.env.NODE_ENV =>', process.env.NODE_ENV);
				console.log('process.env.APP_ENV =>', process.env.APP_ENV);
				console.log('process.env.LOG_LEVEL =>', process.env.LOG_LEVEL);
				console.log('process.env.COOKIE_NAME =>', process.env.COOKIE_NAME);
				console.log('process.env.SERVICE_MYACCOUNT =>', process.env.SERVICE_MYACCOUNT);
				console.log('process.env.SERVICE_CREATORSTUDIO =>', process.env.SERVICE_CREATORSTUDIO);
				console.log('process.env.SERVICE_TALK =>', process.env.SERVICE_TALK);
				console.log('process.env.SERVICE_WEBSOCKETS =>', process.env.SERVICE_WEBSOCKETS);
				console.log('process.env.SERVICE_PWA =>', process.env.SERVICE_PWA);
				console.log('process.env.SERVICE_API =>', process.env.SERVICE_API);
				console.log('process.env.SERVICE_PROFILES =>', process.env.SERVICE_PROFILES);
				console.log('process.env.SERVICE_JOBS =>', process.env.SERVICE_JOBS);
				console.log('process.env.GOOGLE_TRANSLATE_CONFIG_PATH =>', process.env.GOOGLE_TRANSLATE_CONFIG_PATH);
				console.log('process.env.IMAGE_BASE_CDN =>', process.env.IMAGE_BASE_CDN);
				console.log('process.env.CAPTABLE_IMAGE_BASE_CDN =>', process.env.CAPTABLE_IMAGE_BASE_CDN);
				console.log('process.env.S3_UPLOAD_PATH =>', process.env.S3_UPLOAD_PATH);
				console.log('process.env.GENERIC_UPLOAD_PATH =>', process.env.GENERIC_UPLOAD_PATH);
				console.log('process.env.CDN_PATH =>', process.env.CDN_PATH);
				console.log('process.env.NEWRELIC_ENABLED =>', process.env.NEWRELIC_ENABLED);
				console.log('process.env.GOOGLE_PROJECT =>', process.env.GOOGLE_PROJECT);
				console.log('=====================================');
			}
			resolve(config);
		}
	});
});

module.exports = decryptCredentials;
