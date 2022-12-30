const companyProductForProfile = (companyProduct) => {
	if (!companyProduct || !companyProduct.companyId || !companyProduct.sectorId) {
		return null;
	}
	return {
		id: companyProduct.id ? companyProduct.id : undefined,
		updatedId: companyProduct.updatedId ? companyProduct.updatedId : undefined,
		name: companyProduct.name,
		type: companyProduct.type,
		description: companyProduct.description,
		website: companyProduct.website,
		logo: companyProduct.logo,
		sector: companyProduct.sector ? companyProduct.sector.id : undefined,
		sectorName: companyProduct.sector ? companyProduct.sector.name : undefined,
		status: companyProduct.status,
		offers: companyProduct.offers ? companyProduct.offers : [],
		createdAt: companyProduct.createdAt,
	};
};

const companyProductsInfo = (product, companyId) => {
	let logo = product.logo;
	try {
		logo = JSON.parse(product.logo);
	} catch (err) {} // eslint-disable-line no-empty
	const parsedProduct = {
		id: product.id ? product.id : undefined,
		companyId,
		name: product.name,
		type: product.type ? product.type : 'PRODUCT',
		description: product.description ? product.description : null,
		website: product.website ? product.website : null,
		logo: logo && logo.url ? product.logo : {},
		sectorId: product.sector ? product.sector : null,
	};
	return parsedProduct;
};

module.exports = {
	companyProductForProfile,
	companyProductsInfo,
};
