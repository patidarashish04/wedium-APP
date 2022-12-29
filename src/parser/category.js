// category info
const categoryInfo = (category, format) => {
	if (format === 'minimal') {
		return ({
			id: category.id,
			name: category.name,
			slug: category.slug,
		});
	}
	return ({
		id: category.id,
		name: category.name,
		slug: category.slug,
		description: category.description ? category.description : undefined,
		imagelocation: category.imagelocation ? category.imagelocation : undefined,
		locale: category.locale,
	});
};

module.exports = {
	categoryInfo,
};
