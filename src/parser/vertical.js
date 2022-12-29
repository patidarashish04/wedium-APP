// vertical info
const verticalInfo = (vertical, format) => {
	if (!vertical || !vertical.id) {
		return null;
	}
	const baseObj = {
		name: vertical.name,
		slug: vertical.slug,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return (Object.assign(baseObj, {
		description: vertical.description,
	}));
};

module.exports = {
	verticalInfo,
};
