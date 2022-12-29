/**
 * Gets the share count for facebook, linkedin and twitter and updates the same in the DB
 * @param {int} content_id The content id for which share counts need to be updated
 */
const updateShareCountForArticles = (content_id, token) => {
	// since this is executed in a worker, the requre statements cannot be outside
	const request = require('request');
	const options = {
		url: `${process.env.SERVICE_PWA}/api/v2/services/shares/update?content_id=${content_id}`,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
	return new Promise((resolve, reject) => {
		try {
			request.get(options, (err, response) => {
				if (!err && response.statusCode === 200) {
					resolve(true);
				} else {
					console.log(`Error in updating share counts for the content with id ${content_id}`);
					resolve(false);
				}
			});
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	updateShareCountForArticles,
};
