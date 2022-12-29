// curatedInterest info
const curatedInterestInfo = (curatedInterest, format) => {
	const baseObj = {
		id: curatedInterest.id,
		slug: curatedInterest.slug,
		name: curatedInterest.name,
		locale: curatedInterest.locale,
		type: curatedInterest.type,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return Object.assign(baseObj, {
		description: curatedInterest.description ? curatedInterest.description : undefined,
		imagelocation: curatedInterest.imagelocation ? curatedInterest.imagelocation : undefined,
	});
};

module.exports = {
	curatedInterestInfo,
};
