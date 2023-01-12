const AWS = require('aws-sdk');

const PROFILE = 'default';
const DISABLE_ASSUME_ROLE = true;
const REGION = 'ap-southeast-1';
const REGION_US = 'us-east-1';
const { APP_ENV } = process.env;
const SNS_FILE_NAME = APP_ENV === 'production' ? 'aws.sns.production' : APP_ENV === 'staging' ? 'aws.sns.staging' : 'aws.sns.local';
const SNS_TOPICS = require(`./${SNS_FILE_NAME}`);

const credentials = new AWS.SharedIniFileCredentials({
	profile: PROFILE,
	region: REGION,
	disableAssumeRole: DISABLE_ASSUME_ROLE
});

AWS.config.credentials = credentials;

const SNS = new AWS.SNS({ region: REGION });

const Lambda = new AWS.Lambda({ region: REGION });

const Polly = new AWS.Polly({
	signatureVersion: 'v4',
	region: REGION_US
});

export { SNS, SNS_TOPICS, Polly, Lambda };