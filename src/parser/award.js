const { getFormattedDate } = require('../utils/common');

// award info
const awardInfo = (award, format) => {
	if (!award || !award.id) {
		return null;
	}
	const baseObj = {
		id: award.id,
		name: award.name,
		slug: award.slug,
		logo: award.logo && award.logo.url ? ({
			height: award.logo.height,
			width: award.logo.width,
			url: award.logo.url,
		}) : undefined,
		subtitle: award.subtitle,
		awardType: award.awardType,
		date: award.date ? getFormattedDate(award.date, award.dateFormat) : null,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return (Object.assign(baseObj, {
		description: award.description,
		banner: award.banner && award.banner.url ? ({
			height: award.banner.height,
			width: award.banner.width,
			url: award.banner.url,
		}) : undefined,
		primarySponsor: award.primarySponsor,
		secondarySponsors: award.secondarySponsors,
	}));
};

module.exports = {
	awardInfo,
};
