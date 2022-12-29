const apicache = require('apicache');

const env = process.env.APP_ENV || 'development';
const cache = apicache.options({
	headers: {
		'cache-control': 'public,max-age=600,stale-while-revalidate=10',
	},
	enabled: env !== 'development',
	statusCodes: {
		include: [200],
	},
})
	.middleware;

module.exports = cache;
