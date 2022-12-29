import logger from '../utils/logger';

const crypto = require('crypto');
const services = require('../dao/database');
const { checkType } = require('../utils/utility_function');

const envConfig = global.config;
const key = envConfig.authentication.key;
const iv = envConfig.authentication.iv;

exports.encryptUserData = (userData) => {
	try {
		const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
		const tokenData = {
			id: userData.id,
			name: userData.name,
			username: userData.username,
			primary_email: userData.primary_email,
			facebook_id: userData.facebook_id,
			facebook_email: userData.facebook_email,
			facebook_name: userData.facebook_name,
			linkedin_id: userData.linkedin_id,
			linkedin_email: userData.linkedin_email,
			linkedin_name: userData.linkedin_name,
			google_id: userData.google_id,
			google_email: userData.google_email,
			google_name: userData.google_name,
			twitter_id: userData.twitter_id,
			twitter_email: userData.twitter_email,
			twitter_name: userData.twitter_name,
			apple_id: userData.apple_id,
			apple_email: userData.apple_email,
			apple_name: userData.apple_name,
			profile_image: userData.profile_image,
			employee: userData.employee,
			verified_email: userData.verified_email,
		};
		const data = JSON.stringify(tokenData);
		let encrypted = cipher.update(data);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		const encryptedToken = encrypted.toString('hex');
		return encryptedToken;
	} catch (e) {
		logger.error('Failed to encrypt user data.', e);
		throw new Error(e);
	}
};

exports.decryptUserData = (req, res, next) => {
	try {
		res.locals.userData = null;
		let token = null;
		if (req.headers && req.headers.authorization) {
			const parts = req.headers.authorization.split(' ');
			if (parts.length === 2 && parts[0] === 'Bearer') {
				token = parts[1];
			}
		}
		if (!token) {
			next();
			return null;
		}
		logger.customAttributes({ token });
		const encryptedText = Buffer.from(token, 'hex');
		const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		const userData = JSON.parse(decrypted);
		if (userData && userData.id) {
			return services.users.findOne({ where: { id: userData.id }, raw: true })
				.then((user) => {
					if (checkType(user, 'object') && user.id) {
						res.locals.userData = user;
						next();
						return null;
					}
					logger.error('User not found', { token });
					return res.sendStatus(401);
				})
				.catch((err) => {
					logger.error('User failed to fetch', err);
					return res.sendStatus(401);
				});
		}
		logger.error('Malformed user token', { token });
		return res.sendStatus(401);
	} catch (e) {
		logger.error('Decrypt user token error', e);
		return res.sendStatus(401);
	}
};
