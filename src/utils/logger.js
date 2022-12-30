import newrelic from 'newrelic';

const { NEWRELIC_ENABLED } = process.env;

export default {

	customAttributes(data) {
		if (NEWRELIC_ENABLED) {
			newrelic.addCustomAttributes(data);
		}
	},

	info(...message) {
		console.log(...message);
	},

	error(message, err) {
		console.log(message, err);
		if (NEWRELIC_ENABLED) {
			newrelic.noticeError(err, {
				message,
			});
		}
	},

};
