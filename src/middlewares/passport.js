const passport = require('passport');
const session = require('express-session');
const PostgreSqlStore = require('connect-pg-simple')(session);
const PgPool = require('pg').Pool;
const services = require('../dao/database');
const { checkType } = require('../utils/utility_function');

const envConfig = global.config;

function sessionMiddleware() {
	try {
		passport.serializeUser((user, done) => {
			done(null, user.id);
			return null;
		});

		passport.deserializeUser((id, done) => {
			services.users.findOne({ where: { id }, raw: true }).then((user) => {
				if (checkType(user, 'object')) {
					if (user.local_password && (user.local_password !== 'needs-resetting')) {
						delete user.local_password;
						user.local_password = true;
					}
				}
				done(null, user);
				return null;
			}).catch((err) => {
				done(err, null);
				return err;
			});
		});

		return session({
			key: process.env.COOKIE_NAME,
			secret: envConfig.cookie_secret,
			saveUninitialized: false,
			maxAge: new Date(Date.now() + 3600000),
			proxy: true,
			resave: true,
			cookie: {
				...envConfig.cookie_params,
				sameSite: 'none',
				secure: true,
				domain: '.yourstory.com',
			},
			store: new PostgreSqlStore({
				pool: new PgPool({
					host: envConfig.postgres.write_host,
					database: envConfig.postgres.database,
					user: envConfig.postgres.username,
					password: envConfig.postgres.password,
					port: envConfig.postgres.port,
					max: process.env.NODE_ENV === 'development' ? 5 : 20,
					idleTimeoutMillis: 10000,
					connectionTimeoutMillis: 10000,
					acquireTimeoutMillis: 30000,
				}),
			}),
		});
	} catch (err) {
	}
}

function passportInit() {
	return passport.initialize();
}

function passportSession() {
	return passport.session();
}

module.exports = {
	sessionMiddleware,
	passportInit,
	passportSession,
};
