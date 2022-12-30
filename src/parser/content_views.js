const { getLapsedTime } = require('../utils/common');

export const parseTrending = (data) => {
	if (data && data.length > 0) {
		return data.map((item) => {
			const {
				id, title, publishedUrl, publishedAt,
			} = item;
			const timeLapsed = getLapsedTime(publishedAt);
			return {
				id,
				title,
				path: publishedUrl,
				publishedAt,
				timeLapsed,
			};
		});
	}
};
