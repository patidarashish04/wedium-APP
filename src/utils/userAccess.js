const { Op } = require('sequelize');

const {
	brandsBySlugs, internalBrandsBySlugs, brandById, brandBySlug,
} = require('../services/Brands/functions');

const dbServices = require('../dao/queries/index');
const { parseDate, datediff } = require('./utility_function');

// brand slugs from brand roles +
const getBrandSlugsFromRoles = (brandRoles) => {
	try {
		const brandSlugs = Object.keys(brandRoles)
			.reduce((acc, curr) => {
				if (brandRoles[curr] !== 0) {
					acc.push(curr);
				}
				return acc;
			}, []);
		return brandSlugs;
	} catch (err) {
		throw new Error(err);
	}
};

// editor brand slugs from brand roles +
const getEditorBrandSlugsFromRoles = (brandRoles) => {
	try {
		const brandSlugs = Object.keys(brandRoles)
			.reduce((acc, curr) => {
				if (brandRoles[curr] >= 4) {
					acc.push(curr);
				}
				return acc;
			}, []);
		return brandSlugs;
	} catch (err) {
		throw new Error(err);
	}
};

// Get all user brands +
const getAllUserBrands = async (user) => {
	try {
		const brandRoles = user.roles.brand;
		const brandSlugs = getBrandSlugsFromRoles(brandRoles);
		const brands = await brandsBySlugs(brandSlugs);
		return brands;
	} catch (err) {
		throw new Error(err);
	}
};

// Get all user internal brands +
const getAllUserInternalBrands = async (user) => {
	try {
		const brandRoles = user.roles.brand;
		const brandSlugs = getBrandSlugsFromRoles(brandRoles);
		const brands = await internalBrandsBySlugs(brandSlugs);
		return brands;
	} catch (err) {
		throw new Error(err);
	}
};

// editor brands +
const getEditorBrands = async (user) => {
	try {
		const brandRoles = user.roles.brand;
		const brandSlugs = getEditorBrandSlugsFromRoles(brandRoles);
		const brands = await brandsBySlugs(brandSlugs);
		return brands;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to brand spotlight +
const accessBrandSpotlight = (user) => {
	try {
		const roles = user.roles;
		if (roles.brandSpotlightManager && roles.brandSpotlightManager === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to brand +
const accessBrand = async (user, brand) => {
	try {
		const id = Number(brand);
		let brandData;
		switch (typeof (id || brand)) {
		case 'number':
			brandData = await brandById(id);
			break;
		case 'string':
			brandData = await brandBySlug(brand);
			break;
		default:
			break;
		}
		if (brandData) {
			if (Object.keys(user.roles.brand).includes(brandData.slug) && user.roles.brand[brandData.slug] !== 0) {
				return [true, brandData];
			}
		}
		return [false];
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to dyanmic configuration +
const accessDynamicConfiguration = (user) => {
	try {
		const configRole = user.roles.configManager;
		if (configRole !== undefined && configRole === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to redirections +
const accessRedirections = (user) => {
	try {
		const redirectionRole = user.roles.redirectionManager;
		if (redirectionRole !== undefined && redirectionRole === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to feed list +
const accessFeed = async (user) => {
	try {
		const userInternalBrands = await getAllUserInternalBrands(user);
		if (userInternalBrands && userInternalBrands.length > 0) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to video manager +
const accessVideos = (user) => {
	try {
		const configRole = user.roles.videoManager;
		if (configRole !== undefined && configRole === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to notification manager +
const accessNotifications = (user) => {
	try {
		const configRole = user.roles.notificationsManager;
		if (configRole !== undefined && configRole === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

const accessCompanyProfiles = (user, accessType, source) => {
	try {
		const configRole = user.roles.companyManager;
		const isEmployee = user.employee;
		if (source === 'story-editor') {
			return true;
		}
		switch (accessType) {
		case 'companyEditor': {
			const isEditor = Object.keys(user.roles.brand).filter((role) => user.roles.brand[role] >= 4).length > 0;
			if (isEmployee && ((configRole !== undefined && configRole >= 1) || isEditor)) return true;
			return false;
		}
		case 'cities':
		case 'awards':
		case 'verticals':
		case 'people':
			if (isEmployee && configRole !== undefined && configRole >= 1) return true;
			return false;
		case 'desk':
			if (isEmployee && configRole !== undefined && configRole >= 2) return true;
			return false;
		default:
			return false;
		}
	} catch (err) {
		throw new Error(err);
	}
};

const accessLocale = async (user, locale) => {
	const brandEditorAccess = Object.keys(user.roles.brand).filter((role) => user.roles.brand[role] >= 1);
	let hasAccess = false;
	let tempLocale;
	const allBrands = await brandsBySlugs(brandEditorAccess, ['locale']);
	for (let i = 0; i < allBrands.length; i++) {
		if (allBrands[i].locale.toLowerCase() === locale.toLowerCase()) {
			hasAccess = true;
			tempLocale = allBrands[i].locale;
			break;
		}
	}
	return [hasAccess, tempLocale];
};

const isUserCompanyAdmin = (user, companyId) => user && user.roles && user.roles.company && user.roles.company[companyId] > 0;

// verify access to Webinar manager +
const accessWebinar = (user) => {
	try {
		const configRole = user.roles.webinarManager;
		if (configRole !== undefined && configRole === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to App manager
const accessAppManager = (user) => {
	try {
		const configRole = user.roles.appManager;
		if (configRole !== undefined && configRole === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to pay content
const accessPaidContent = async (userId, type, subType, storyId, info = null, paymentMode = 'NON-UPI') => {
	if (userId) {
		if (type === 'login') {
			return true;
		} if (type === 'subscription') {
			if (!subType) {
				return false;
			}
			const subscription = await dbServices.subscriptionPackages.subscriptionPackageByCustomObj({ id: subType, status: 'ACTIVE' });
			if (subscription) {
				let where = {
					userId,
					// subscriptionId: subType,
					// [Op.or]: [{ status: { [Op.in]: ['active', 'SUCCESS', 'authenticated', 'PENDING', 'FAILED'] } }],
				};
				let userSub = await dbServices.userSubscriptions.userSubscriptionByCustomObj(where);
				if (userSub && !['active', 'SUCCESS', 'authenticated'].includes(userSub.status)) {
					where = {
						userId,
						// subscriptionId: subType,
						[Op.or]: [{ status: { [Op.in]: ['active', 'SUCCESS', 'authenticated'] } }],
					};
					const userSubPrevious = await dbServices.userSubscriptionsPrevious.userSubscriptionByCustomObj(where);
					if (userSubPrevious) userSub = userSubPrevious;
					if (!['active', 'SUCCESS', 'authenticated'].includes(userSub.status)) userSub = null;
				}
				let price;
				if (userSub && subType === userSub.subscriptionId) {
					price = subscription.price[userSub.stripePriceId];
				}
				let isCancelled;
				if (userSub && paymentMode === 'UPI') {
					isCancelled = await dbServices.subscriptionLogs.getLogs({ userId, pgSubscriptionId: userSub.pgSubscriptionId, eventType: 'cancelled' });
				}
				if (info) {
					return {
						userSub: !!userSub,
						updatedAt: userSub ? userSub.startAt : userSub && userSub.updatedAt,
						endAt: userSub ? userSub.endAt : null,
						cancelled: userSub && userSub.endedAt ? true : !!isCancelled,
						subscriptionPrice: price || null,
					};
				}
				const userData = await dbServices.users.getUserById(userId);
				if (userData) {
					const category = await dbServices.userCategory.userCategoryByCustomObj({ id: userData.user_categories_id }, ['accessible_items', 'privileged_days']);
					const createdAt = userData.created_at.toISOString().split('T')[0];
					const currentDate = new Date().toISOString().split('T')[0];
					const consumedDays = datediff(parseDate(createdAt), parseDate(currentDate));
					if (category.privileged_days - consumedDays > 0) return true;
				}
				return !!userSub;
			}

			return false;
		} if (type === 'micropayment') {
			const userSub = await dbServices.userSubscriptions.userSubscriptionByCustomObj({ storyId, status: 'SUCCESS', userId });
			return !!userSub;
		}
		return false;
	}
	return false;
};

const getSubscriptionDetailForCaptable = async (userId, paymentMode = 'NON-UPI') => {
	try {
		let where = {
			userId,
			// subscriptionId: subType,
			// [Op.or]: [{ status: { [Op.in]: ['active', 'SUCCESS', 'authenticated', 'PENDING', 'FAILED'] } }],
		};
		let userSub = await dbServices.userSubscriptions.userSubscriptionByCustomObj(where);

		if (userSub && !['active', 'SUCCESS', 'authenticated'].includes(userSub.status)) {
			where = {
				userId,
				// subscriptionId: subType,
				[Op.or]: [{ status: { [Op.in]: ['active', 'SUCCESS', 'authenticated'] } }],
			};
			const userSubPrevious = await dbServices.userSubscriptionsPrevious.userSubscriptionByCustomObj(where);
			// if (userSubPrevious) userSub = userSubPrevious;
			userSub = userSubPrevious;
		}
		if (userSub) {
			const subscription = await dbServices.subscriptionPackages.subscriptionPackageByCustomObj({ id: userSub.subscriptionId, status: 'ACTIVE' });
			const price = subscription.price[userSub.stripePriceId];
			let isCancelled;
			if (userSub && paymentMode === 'UPI') {
				isCancelled = await dbServices.subscriptionLogs.getLogs({ userId, pgSubscriptionId: userSub.pgSubscriptionId, eventType: 'cancelled' });
			}

			return {
				userSub: !!userSub,
				updatedAt: userSub ? userSub.startAt : userSub && userSub.updatedAt,
				endAt: userSub ? userSub.endAt : null,
				cancelled: userSub && userSub.endedAt ? true : !!isCancelled,
				subscriptionPrice: price || null,
				priceId: userSub?.stripePriceId,
			};
		} return null;
	} catch (err) {
		throw new Error(err);
	}
};

// verify access to jobs manager +
const accessJobs = (user) => {
	try {
		const roles = user.roles;
		if (roles.jobsManager && roles.jobsManager === 1) {
			return true;
		}
		return false;
	} catch (err) {
		throw new Error(err);
	}
};

const hasAccess = ({ roles }, component) => {
	try {
		return roles[`${component}Manager`] && roles[`${component}Manager`] === 1;
	} catch (err) {
		throw new Error(err);
	}
};

const accessProfileClaimAccess = ({ roles }) => {
	try {
		return roles.companyManager && roles.companyManager === 2;
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = {
	getAllUserBrands,
	getAllUserInternalBrands,
	accessBrandSpotlight,
	accessBrand,
	accessDynamicConfiguration,
	accessRedirections,
	accessFeed,
	accessVideos,
	getBrandSlugsFromRoles,
	getEditorBrands,
	accessNotifications,
	accessCompanyProfiles,
	accessLocale,
	isUserCompanyAdmin,
	accessWebinar,
	accessAppManager,
	accessPaidContent,
	accessJobs,
	hasAccess,
	accessProfileClaimAccess,
	getSubscriptionDetailForCaptable,
};
