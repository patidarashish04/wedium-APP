// brand info
const brandInfo = (brand, format) => {
	if (format === 'minimal') {
		return ({
			name: brand.name,
			slug: brand.slug,
			locale: brand.locale,
		});
	} if (format === 'ALL') {
		return ({
			id: brand.id,
			name: brand.name,
			slug: brand.slug,
			locale: brand.locale,
			internal: brand.internal,
			websiteTakeover: brand.websiteTakeover,
			stickySidebarAds: brand.stickySidebarAds,
		});
	}
	return ({
		id: brand.id,
		name: brand.name,
		slug: brand.slug,
		description: brand.description ? brand.description : undefined,
		imagelocation: brand.imagelocation ? brand.imagelocation : undefined,
		locale: brand.locale,
		internal: brand.internal,
	});
};

// brand page info
const brandPageInfo = (brand, application) => ({
	id: brand.id,
	displayName: brand.name,
	brandLogo: brand.imagelocation ? brand.imagelocation : undefined,
	locale: brand.locale,
	path: `/${brand.slug}`,
	socialLinks: brand.socialLinks,
	messengerLink: brand.messengerLink,
	websiteTakeover: brand.websiteTakeover,
	stickySidebarAds: brand.stickySidebarAds,
	structureAPI: brand.structureAPI ? `${brand.structureAPI}${application ? `?application=${application}` : ''}` : undefined,
});

// brand Ids
const brandIdsFromBrands = (brands) => {
	const ids = brands.map((brand) => brand.id);
	return ids;
};

module.exports = {
	brandInfo,
	brandPageInfo,
	brandIdsFromBrands,
};
