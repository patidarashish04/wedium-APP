const UTIL = require('../utils/utility_function');

const USER_PRIVILEGES = {
	AUTHOR: 1,
	MARKETER: 2,
	CAMPAIG_PUBLISHER: 3,
	EDITOR: 4,
	CHIEF_EDITOR: 5,
	ADMIN: 6,
};

const brandAuth = (brand, value) => (req, res, next) => {
	if (UTIL.checkNested(req, 'user', 'roles', 'brand', brand)) {
		if (req.user.roles.brand >= USER_PRIVILEGES[value]) {
			return next();
		}
	}
	return res.sendStatus(403);
};

const managerAuth = (manager, value = 1) => (req, res, next) => {
	if (UTIL.checkNested(req, 'user', 'roles', manager)) {
		if (req.user.roles[manager] >= value) {
			return next();
		}
	}
	return res.sendStatus(403);
};

const isLoggedInToUpdate = (req, res, next) => {
	if (req.user || req.session.resetEmail) {
		return next();
	}
	return res.sendStatus(403);
};

const isLoggedInToFetch = (req, res, next) => {
	if (req.user) {
		return next();
	}
	return res.sendStatus(403);
};

const isRoleEditorOrHigher = (req, res, next) => {
	if (req.user && req.user.roles) {
		const keyArray = Object.keys(req.user.roles.brand);
		let isRoleAbove = false;
		keyArray.forEach((ele) => {
			if (req.user.roles.brand[ele] > 3) {
				isRoleAbove = true;
			}
		});
		if (isRoleAbove) {
			return next();
		}
	}
	return res.sendStatus(403);
};

const isRoleAuthorOrHigher = (req, res, next) => {
	if (req.user && req.user.roles) {
		const keyArray = Object.keys(req.user.roles.brand);
		let isRoleAbove = false;
		keyArray.forEach((ele) => {
			if (req.user.roles.brand[ele] > 1) {
				isRoleAbove = true;
			}
		});
		if (isRoleAbove) {
			return next();
		}
	}
	return res.status(403).send({ status: 'fail', error: { message: 'Not authorized' } });
};

module.exports = {
	brandAuth,
	managerAuth,
	isLoggedInToUpdate,
	isLoggedInToFetch,
	isRoleEditorOrHigher,
	isRoleAuthorOrHigher,
};
