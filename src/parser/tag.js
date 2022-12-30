// tag info
const tagInfo = (tag, format) => {
	if (format === 'minimal') {
		return ({
			name: tag.name,
			slug: tag.slug,
			order: tag.order,
		});
	}
	return ({
		id: tag.id,
		name: tag.name,
		slug: tag.slug,
		description: tag.description ? tag.description : undefined,
		imagelocation: tag.imagelocation ? tag.imagelocation : undefined,
		locale: tag.locale,
		order: tag.order,
	});
};

module.exports = {
	tagInfo,
};
