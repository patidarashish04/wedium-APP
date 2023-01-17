import logger from '../utils/logger';

const headerKey = 'Bearer';

exports.isPreAuthorized = (req, res, next) => {
	// check request headers
	let authorized = false;
	let token;
	if (req.headers && req.headers.authorization) {
		const parts = req.headers.authorization.split(' ');
		if (parts.length === 2 && parts[0] === headerKey) {
			token = parts[1];
		}
	}
	// compare the APP SECRET KEY
	authorized = token && (global.config.app_secret === token);
	if (authorized) {
		next();
	} else {
		logger.error('An unauthorized request was made for an authorized endpoint', { url: req.path, header: req.headers.authorization });
		return res.sendStatus(403);
	}
};
