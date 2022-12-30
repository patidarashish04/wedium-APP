const companyOfferForProfile = (offer, createdAt, updatedAt) => {
	if (!offer || !offer.productId) {
		return null;
	}
	return {
		id: offer.id,
		updateId: offer.id ? undefined : offer.updateId,
		productId: offer.productId,
		status: offer.status,
		description: offer.description,
		image: offer.image,
		cta_link: offer.cta_link,
		cta_text: offer.cta_text,
		updatedAt: updatedAt || offer.updatedAt,
		createdAt: createdAt || offer.createdAt,
	};
};

const companyOfferInfo = (offer, companyId, productId = null) => {
	if (!offer) {
		return null;
	}
	return {
		companyId,
		productId: productId || undefined,
		status: offer.status ? offer.status : 'ACTIVE',
		description: offer.description ? offer.description : null,
		cta_text: offer.cta_text ? offer.cta_text : null,
		cta_link: offer.cta_link ? offer.cta_link : null,
		image: offer.image ? offer.image : {},
	};
};

module.exports = {
	companyOfferForProfile,
	companyOfferInfo,
};
