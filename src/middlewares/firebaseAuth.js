import logger from '../utils/logger';
import dbServices from '../dao/queries/index';

const services = require('../dao/database');
const { adminAuth } = require('../utils/firebase');
const { sessionsByUserId, createSession, deleteSessionByWhereObj } = require('../services/CaptableAuthSessions/functions');
const {
	createUserName, isAnEmployee, createAuthorMetaRecord, getUserCategory,
} = require('../services/Authentication/functions');

const MAXIMUM_LOGIN_LIMIT = 3;

const firebaseAuthenticate = async (req, res, next) => {
	res.user = null;
	try {
		let token = null;
		if (req.headers['x-auth'] && req.headers['x-auth']) {
			const parts = req.headers['x-auth'].split(' ');
			if (parts.length === 2 && parts[0] === 'Bearer') {
				token = parts[1];
			}
		}
		if (!token) {
			return res.status(401).send('BAD REQUEST!');
		}
		const userData = await adminAuth.auth().verifyIdToken(token, true);
		if (userData && userData.uid) {
			let email = userData.email?.toLowerCase();
			let name = userData.name || userData.displayName;
			if (!(email && name)) {
				const data = await adminAuth.auth().getUser(userData.uid);
				if (!email) {
					email = data?.providerData?.[0]?.email?.toLowerCase();
					userData.email = email;
				}
				if (!name) {
					name = data?.providerData?.[0]?.displayName;
					userData.displayName = name;
				}
			}
			if (!email) {
				logger.error(`Firebase auth failed - no email present. Data: ${JSON.stringify(userData)}`);
				return res.status(403).send({ err: 'Error Fetching User Details from Firebase - no email present' });
			}
			const emailQueryArray = [{ primary_email: email }, { facebook_email: email }, { google_email: email }, { linkedin_email: email }, { twitter_email: email }, { apple_email: email }];
			const dbUser = await services.users.findOne({ where: { [services.Op.or]: emailQueryArray }, raw: true });
			if (dbUser) {
				req.user = dbUser;
				req.firebaseUserData = userData;
				req.firebaseUserData.newUser = false;
			} else {
				// Firebase new user here
				const username = await createUserName(userData.email, userData.displayName);

				// Adding getUserCategory() to get User's category, default is 1(General User)
				const userObject = {
					username, name: userData.displayName || userData.name, primary_email: userData.email, profile_image: userData.photoURL, employee: isAnEmployee(userData.email), user_categories_id: await getUserCategory(userData.email),
				};
				const newUser = await dbServices.users.createUser(userObject);
				// Create Author Meta Record On SignUp
				await createAuthorMetaRecord(newUser, newUser.name, null, null, newUser.profile_image, newUser.employee);

				req.user = newUser;
				req.firebaseUserData = userData;
				req.firebaseUserData.newUser = true;
			}
			next();
		} else {
			logger.error(`Firebase auth failed - no UID present. Data: ${JSON.stringify(userData)}`);
			return res.status(403).send({ err: 'Error Fetching User Details from Firebase - no uid present' });
		}
	} catch (error) {
		logger.error('Firebase auth failed error:', error);
		return res.status(403).send({ err: error });
	}
};

const verifySessionCookiesProtected = async (req, res, next) => {
	const sessionCookie = req.cookies[process.env.CAPTABLE_COOKIE_NAME] || '';
	try {
		const decodedClaims = await adminAuth.auth().verifySessionCookie(sessionCookie, true);
		if (decodedClaims) {
			let email = decodedClaims.email?.toLowerCase();
			if (!email) {
				const data = await adminAuth.auth().getUser(decodedClaims.uid);
				email = data?.providerData?.[0]?.email?.toLowerCase();
				decodedClaims.email = email;
			}
			if (!email) {
				logger.error(`Protected session verification failed - no email present. Data: ${JSON.stringify(decodedClaims)}`);
				return res.status(403).send({ err: 'Error Fetching User Details from Firebase - no email present' });
			}
			const emailQueryArray = [{ primary_email: email }, { facebook_email: email }, { google_email: email }, { linkedin_email: email }, { twitter_email: email }, { apple_email: email }];
			const dbUser = await services.users.findOne({ where: { [services.Op.or]: emailQueryArray }, raw: true });
			req.user = dbUser;
			req.firebaseUserData = decodedClaims;
			next();
		} else {
			logger.error(`Protected session verification failed - no UID present. Data: ${JSON.stringify(decodedClaims)}`);
			return res.status(403).send('UNAUTHORIZED REQUEST!');
		}
	} catch (error) {
		logger.error('Protected session verification error:', error);
		return res.status(403).send('UNAUTHORIZED REQUEST!');
	}
};

const verifySessionCookies = async (req, res, next) => {
	const sessionCookie = req.cookies[process.env.CAPTABLE_COOKIE_NAME] || '';
	try {
		const decodedClaims = await adminAuth.auth().verifySessionCookie(sessionCookie, true);
		if (decodedClaims) {
			let email = decodedClaims.email?.toLowerCase();
			if (!email) {
				const data = await adminAuth.auth().getUser(decodedClaims.uid);
				email = data?.providerData?.[0]?.email?.toLowerCase();
				decodedClaims.email = email;
			}
			if (!email) {
				next();
				return;
			}
			const emailQueryArray = [{ primary_email: email }, { facebook_email: email }, { google_email: email }, { linkedin_email: email }, { twitter_email: email }, { apple_email: email }];
			const dbUser = await services.users.findOne({ where: { [services.Op.or]: emailQueryArray }, raw: true });
			req.user = dbUser;
		} else {
			req.user = {};
		}
		next();
	} catch (error) {
		next();
	}
};

const captableAuthTimeHandler = async (req, res, next) => {
	try {
		const dbUser = req.user;
		const firebaseUserData = req.firebaseUserData;
		if (firebaseUserData && dbUser) {
			const sessions = await sessionsByUserId(dbUser.id);
			const authTimes = sessions.map((session) => session.authTime);
			if (authTimes.length < MAXIMUM_LOGIN_LIMIT && !authTimes.includes(firebaseUserData.auth_time)) {
				await createSession({ userId: dbUser.id, authTime: firebaseUserData.auth_time });
			} else if (authTimes.length === MAXIMUM_LOGIN_LIMIT && !authTimes.includes(firebaseUserData.auth_time)) {
				await deleteSessionByWhereObj({ id: sessions[0].id });
				await createSession({ userId: dbUser.id, authTime: firebaseUserData.auth_time });
			}
			next();
		}
	} catch (error) {
		logger.error('Captable login limitation error:', error);
		return res.status(403).send('UNAUTHORIZED REQUEST!');
	}
};

const captableSessionVerifier = async (req, res, next) => {
	try {
		const dbUser = req.user;
		const firebaseUserData = req.firebaseUserData;
		if (firebaseUserData && dbUser) {
			const sessions = await sessionsByUserId(dbUser.id);
			const authTimes = sessions.map((session) => session.authTime);
			if (authTimes.length === MAXIMUM_LOGIN_LIMIT && !authTimes.includes(firebaseUserData.auth_time)) {
				await deleteSessionByWhereObj({ userId: dbUser.id, authTime: firebaseUserData.auth_time });
				res.clearCookie(process.env.CAPTABLE_COOKIE_NAME);
				return res.status(403).send({ loginLimitation: true, message: 'LOGIN LIMITATION REACHED' });
			}
		}
		next();
	} catch (error) {
		logger.error('Captable login limitation verification error:', error);
		return res.status(403).send('UNAUTHORIZED REQUEST!');
	}
};

module.exports = {
	firebaseAuthenticate,
	verifySessionCookies,
	verifySessionCookiesProtected,
	captableAuthTimeHandler,
	captableSessionVerifier,
};
