const moment = require('moment');

// webinar info
const webinarInfo = ({ webinar }) => {
	const baseObj = {
		id: webinar.id,
		startTime: webinar.startTime,
		startDate: webinar.startTime ? moment(webinar.startTime).utcOffset(330).format('MMMM DD, YYYY') : undefined,
		endTime: webinar.endTime,
		startTimeUnix: webinar.startTime ? moment(webinar.startTime).valueOf() : undefined,
		endTimeUnix: webinar.endTime ? moment(webinar.endTime).valueOf() : undefined,
		platformName: webinar.platformName,
		platformId: webinar.platformId,
		platformPassword: webinar.platformPassword,
		platformConfig: webinar.platformConfig,
		platformLiveUrl: webinar.platformLiveUrl,
		tnc: webinar.tnc,
		liveStreamConfig: webinar.liveStreamConfig,
	};
	return baseObj;
};

module.exports = {
	webinarInfo,
};
