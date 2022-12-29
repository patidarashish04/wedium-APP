// brandSpotlight info
const brandSpotlightInfo = (brandSpotlight, format) => {
	if (format === 'minimal') {
		return ({
			name: brandSpotlight.name,
			slug: brandSpotlight.slug,
			thumbnail: brandSpotlight.imagelocation ? brandSpotlight.imagelocation : undefined,
		});
	}
	return ({
		id: brandSpotlight.id,
		name: brandSpotlight.name,
		slug: brandSpotlight.slug,
		website: brandSpotlight.website ? brandSpotlight.website : undefined,
		description: brandSpotlight.description ? brandSpotlight.description : undefined,
		imagelocation: brandSpotlight.imagelocation ? brandSpotlight.imagelocation : undefined,
	});
};

module.exports = {
	brandSpotlightInfo,
};
