const { getFormattedDate } = require('../utils/common');
const { sortAndGroupTimelineItems } = require('../services/CompanyMilestones/functions');
const { sectionTitles } = require('../utils/constants');
const { companyProductForProfile } = require('./company_product');
const { companyOfferForProfile } = require('./company_offer');

// company info
const companyInfo = (company, format) => {
	if (!company || !company.id) {
		return null;
	}
	const baseObj = {
		id: company.id,
		name: company.name,
		slug: company.slug,
		subtitle: company.subtitle,
		logo: company.logo && company.logo.url ? ({
			height: company.logo.height,
			width: company.logo.width,
			url: company.logo.url,
		}) : undefined,
		path: company.status === 'VERIFIED' ? `/companies/${company.slug}` : undefined,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	let location;
	let address;
	if (company.headquarteredCity) {
		const tmp = company.headquarteredCity;
		location = tmp.cities && tmp.cities.name ? `${tmp.cities.name}${tmp.cities.state ? `, ${tmp.cities.state}` : ''}, ${tmp.cities.country ? `, ${tmp.cities.country}` : ''}` : null;
		address = `${tmp.addressLine1 ? `${tmp.addressLine1}, ` : ''}${tmp.addressLine2 ? `${tmp.addressLine2}, ` : ''}${location ? `${location}` : ''}`;
	}
	return (Object.assign(baseObj, {
		description: company.description,
		vision: company.vision,
		website: company.website,
		foundingDate: company.foundingDate ? getFormattedDate(company.foundingDate, company.foundingDateFormat) : null,
		closingDate: company.closingDate ? getFormattedDate(company.closingDate, company.closingDateFormat) : null,
		employeeCount: company.employeeCount ? `${company.employeeCount}+ Employees` : undefined,
		socialLinks: company.socialLinks,
		headquarters: location,
		address,
	}));
};

const companyProfile = (companyDetails, targetMarket, timeline, funding, parsedMetadata, coreTeam, locations, isUserAdmin, products, offers) => {
	const parsedFunding = {
		fundings: funding.data && funding.data.length ? funding.data.sort((a, b) => new Date(a.date) - new Date(b.date)) : [],
		fundingStatus: companyDetails.fundingStatus,
		investors: parsedMetadata ? [...parsedMetadata.individualInvestors, ...parsedMetadata.organisationInvestors, ...parsedMetadata.prominentInvestors] : [],
		totalFunding: parsedMetadata && parsedMetadata.totalFunding ? parsedMetadata.totalFunding : undefined,
		totalFundingAmount: parsedMetadata && parsedMetadata.totalFundingAmount ? parsedMetadata.totalFundingAmount : null,
	};

	const parsedProducts = products.data.map((product) => {
		if (product.id) {
			if (offers[product.id]) {
				if (!product.offers) product.offers = [];
				product.offers.push(offers[product.id]);
				if (product.createdAt < product.offers[0].createdAt) {
					product.createdAt = product.offers[0].createdAt;
				}
				delete product.offers[0].createdAt;
			}
		}
		return product;
	});

	products.data = parsedProducts.sort((a, b) => b.createdAt - a.createdAt).map((item) => {
		delete item.createdAt; return item;
	});

	const introduction = {
		data: {
			name: companyDetails.name,
			logo: companyDetails.logo && companyDetails.logo.url ? ({
				height: companyDetails.logo.height,
				width: companyDetails.logo.width,
				url: `${companyDetails.logo.url}?fm=auto&ar=1:1&mode=fill&fill=solid&fill-color=fff`,
			}) : undefined,
			subtitle: companyDetails.subtitle,
			sectors: parsedMetadata ? parsedMetadata.sectors : [],
			socialLinks: companyDetails.socialLinks,
			iosLink: parsedMetadata ? parsedMetadata.iosLink : null,
			androidLink: parsedMetadata ? parsedMetadata.androidLink : null,
			website: companyDetails.website ? companyDetails.website : null,
			showcaseBadge: companyDetails.showcaseBadge,
		},
		isUpdated: companyDetails.isUpdated,
	};

	let headquarters = null;
	let headquarteredCity = null;
	if (companyDetails.headquarter) {
		headquarters = companyDetails.headquarter;
	}

	const parsedLocations = locations.data && locations.data.length > 0 ? locations.data.map((location) => {
		if (headquarters && location.id === headquarters) {
			location.headquarters = true;
			headquarteredCity = location.city ? `${location.city}${location.state ? `, ${location.state}` : ''}${location.country ? `, ${location.country}` : ''}` : null;
		} else if (!headquarters && location.headquarters) {
			headquarteredCity = location.city ? `${location.city}${location.state ? `, ${location.state}` : ''}${location.country ? `, ${location.country}` : ''}` : null;
		}
		return location;
	}) : [];

	const basicInformation = {
		title: sectionTitles.basicInformation,
		data: {
			description: companyDetails.description,
			legalName: companyDetails.legalName,
			headquarters: headquarteredCity,
			businessModels: parsedMetadata ? parsedMetadata.businessModels : [],
			foundingDateFull: companyDetails.foundingDate,
			foundingDate: companyDetails.foundingDate ? getFormattedDate(companyDetails.foundingDate, companyDetails.foundingDateFormat) : null,
			employeeSize: companyDetails.employee_size,
			coreTeam: coreTeam.data,
			showcaseVideo: companyDetails.showcaseVideo,
		},
		isUpdated: companyDetails.isUpdated || coreTeam.isUpdated,
	};

	const parsedTimeline = sortAndGroupTimelineItems(timeline.data);

	return {
		id: companyDetails.id,
		name: companyDetails.name,
		slug: companyDetails.slug,
		path: companyDetails.status === 'VERIFIED' ? `/companies/${companyDetails.slug}` : undefined,
		sections: {
			introduction,
			basicInformation,
			timeline: { title: sectionTitles.timeline, data: parsedTimeline, isUpdated: timeline.isUpdated },
			targetMarket: { title: sectionTitles.targetMarket, ...targetMarket },
			funding: { title: sectionTitles.funding, data: parsedFunding, isUpdated: funding.isUpdated },
			locations: { data: parsedLocations, isUpdated: locations.isUpdated },
			revenueStreams: { title: sectionTitles.revenueStreams, data: parsedMetadata ? parsedMetadata.revenueStreams : [], isUpdated: companyDetails.isUpdated },
			products: { title: sectionTitles.products, ...products },
		},
		isUserAdmin,
		isCompanyClaimed: companyDetails.isCompanyClaimed,
		disallowConnect: parsedMetadata ? parsedMetadata.disallowConnect : undefined,
	};
};

const companyProfileAlgolia = ({
	company, targetMarket, funding, parsedMetadata, locations, companyProducts,
}) => {
	let companyDetails = {
		objectID: `companies____${company.id}`,
		featured: company.featured,
		slug: company.slug,
		path: `/companies/${company.slug}`,
		name: company.name,
		legalName: company.legalName ? company.legalName : null,
		vision: company.vision ? company.vision : null,
		subtitle: company.subtitle ? company.subtitle : null,
		description: company.description ? company.description : null,
		employeeSize: company.employee_size && company.employee_size.name ? company.employee_size.name : null,
		employeeSizeLevel: null,
		fundingStatus: company.fundingStatus ? company.fundingStatus : null,
		fundingRounds: null,
		latestFundingTimestamp: null,
		lastKnownFundingTimestamp: null,
		website: company.website ? company.website : null,
		logo: company.logo && company.logo.url ? ({
			height: company.logo.height,
			width: company.logo.width,
			url: `${company.logo.url}?fm=png&auto=format&ar=1:1&mode=fill&fill=solid`,
		}) : null,
		socialLinks: company.socialLinks ? company.socialLinks : null,
		createdAt: company.createdAt ? (new Date(company.createdAt)).getTime() : null,
		updatedAt: company.updatedAt ? (new Date(company.updatedAt)).getTime() : null,
		verifiedAt: company.verifiedAt ? (new Date(company.verifiedAt)).getTime() : null,
		foundingDate: company.foundingDate ? {
			date: company.foundingDate,
			format: company.foundingDateFormat,
		} : null,
		foundingDateTimestamp: company.foundingDate ? (new Date(company.foundingDate)).getTime() : null,
		city: null,
		state: null,
		country: null,
		headquarter: null,
		locations: locations.data && locations.data.length > 0 ? locations.data.map((location) => ({
			googleMapLink: location.googleMapLink ? location.googleMapLink : null,
			city: location.city ? location.city : null,
			state: location.state ? location.state : null,
			country: location.country ? location.country : null,
			employeeCount: location.employeeCount ? location.employeeCount : null,
			isHeadquarter: company.headquarteredCity && company.headquarteredCity.id === location.id,
		})) : null,
		audience: targetMarket && targetMarket.data && targetMarket.data.length > 0 ? targetMarket.data : null,
		activeOffer: false,
		products: null,
		type: 'COMPANY',
	};
	if (company.headquarteredCity && company.headquarteredCity.cities && company.headquarteredCity.cities.name) {
		companyDetails.city = company.headquarteredCity.cities.name;
		companyDetails.state = company.headquarteredCity.cities.state;
		companyDetails.country = company.headquarteredCity.cities.country;
		companyDetails.headquarter = `${company.headquarteredCity.cities.name}${company.headquarteredCity.cities.state ? `, ${company.headquarteredCity.cities.state}` : ''}${company.headquarteredCity.cities.country ? `, ${company.headquarteredCity.cities.country}` : ''}`;
	}
	if (companyDetails.employeeSize) {
		switch (companyDetails.employeeSize) {
		case '<10':
			companyDetails.employeeSizeLevel = 1;
			break;
		case '11 to 20':
			companyDetails.employeeSizeLevel = 2;
			break;
		case '21 to 40':
			companyDetails.employeeSizeLevel = 3;
			break;
		case '41 to 60':
			companyDetails.employeeSizeLevel = 4;
			break;
		case '61 to 100':
			companyDetails.employeeSizeLevel = 5;
			break;
		case '101 to 150':
			companyDetails.employeeSizeLevel = 6;
			break;
		case '151 to 250':
			companyDetails.employeeSizeLevel = 7;
			break;
		case '251 to 500':
			companyDetails.employeeSizeLevel = 8;
			break;
		case '501 to 1000':
			companyDetails.employeeSizeLevel = 9;
			break;
		case '1000+':
			companyDetails.employeeSizeLevel = 10;
			break;
		default:
			break;
		}
	}
	if (funding && funding.data && funding.data.length > 0) {
		const fundingRounds = funding.data.map((item) => item.round);
		const fundingTimestamps = funding.data.filter((item) => item.date !== null);
		companyDetails.fundingRounds = fundingRounds ? fundingRounds.filter((round, pos) => fundingRounds.indexOf(round) === pos) : null;
		companyDetails.latestFundingTimestamp = funding.data[0].date ? (new Date(funding.data[0].date)).getTime() : null;
		companyDetails.lastKnownFundingTimestamp = fundingTimestamps && fundingTimestamps.length > 0 ? (new Date(fundingTimestamps[0].date)).getTime() : null;
	}
	if (parsedMetadata) {
		const keyInvestors = [...parsedMetadata.individualInvestors, ...parsedMetadata.organisationInvestors, ...parsedMetadata.prominentInvestors];
		companyDetails = Object.assign(companyDetails, {
			androidAppLink: parsedMetadata.androidLink ? parsedMetadata.androidLink : null,
			iosAppLink: parsedMetadata.iosLink ? parsedMetadata.iosLink : null,
			businessModels: parsedMetadata.businessModels && parsedMetadata.businessModels.length > 0 ? parsedMetadata.businessModels.map((item) => item.name) : null,
			totalFunding: parsedMetadata.totalFunding ? parsedMetadata.totalFunding : null,
			totalFundingAmount: parsedMetadata.totalFundingAmount ? parsedMetadata.totalFundingAmount : null,
			keyInvestors: keyInvestors && keyInvestors.length > 0 ? keyInvestors.map((item) => ({
				name: item.name,
				image: item.image ? item.image : null,
				linkedInUrl: item.linkedInUrl ? item.linkedInUrl : null,
			})) : null,
			revenueStreams: parsedMetadata.revenueStreams && parsedMetadata.revenueStreams.length > 0 ? parsedMetadata.revenueStreams.map((item) => item.name) : null,
			sectors: parsedMetadata.sectors && parsedMetadata.sectors.length > 0 ? parsedMetadata.sectors.map((item) => item.name) : null,
		});
	}
	companyDetails.products = companyProducts && companyProducts.length > 0 ? companyProducts.map((product) => {
		if (product.offers && product.offers.length > 0) {
			if (!companyDetails.activeOffer) {
				companyDetails.activeOffer = true;
			}
			product.offers = product.offers.map((offer) => companyOfferForProfile(offer));
		}
		return companyProductForProfile(product);
	}) : null;
	return companyDetails;
};

const parseCompanyIntroData = (companyData) => {
	const data = {};
	Object.keys(companyData).forEach((item) => {
		if (!['metadata', 'imageFile', 'logo'].includes(item)) {
			if (item === 'socialLinks') {
				let socialLinks = companyData.socialLinks;
				try {
					socialLinks = JSON.parse(companyData.socialLinks);
				} catch (err) {} // eslint-disable-line no-empty
				data.socialLinks = socialLinks;
			} else {
				data[item] = companyData[item];
			}
		}
	});
	return data;
};

const parseBasicInfoForCompanyTable = (companyData) => {
	const data = {};
	Object.keys(companyData).forEach((item) => {
		if (!['metadata', 'coreTeam', 'companyLocation'].includes(item)) {
			if (item === 'employeeSize') {
				data[item] = companyData[item] ? (companyData[item].id ? companyData[item].id : companyData[item].value) : null;
			} else if (item === 'foundingDate') {
				data[item] = companyData[item] ? companyData[item] : null;
				data.foundingDateFormat = 'DATE';
			} else if (item === 'legalName') {
				data[item] = companyData[item];
			} else if (item === 'description') {
				data[item] = companyData[item];
			}
		}
	});
	return data;
};

const companyProfileMinimal = ({
	company, parsedMetadata, coreTeam, format = 'custom-minimal',
}) => {
	const founders = coreTeam && coreTeam.data ? coreTeam.data.filter((i) => i.role === 'FOUNDER') : null;
	let companyDetails = {
		id: company.id,
		slug: company.slug,
		path: `/companies/${company.slug}`,
		name: company.name,
		subtitle: company.subtitle ? company.subtitle : null,
		logo: company.logo && company.logo.url ? ({
			height: company.logo.height,
			width: company.logo.width,
			url: `${company.logo.url}?fm=png&auto=format&ar=1:1&mode=fill&fill=solid`,
		}) : null,
		updatedAt: company.updatedAt ? company.updatedAt : null,
		verifiedAt: company.verifiedAt ? company.verifiedAt : null,
		foundingDate: company.foundingDate ? getFormattedDate(company.foundingDate, company.foundingDateFormat) : null,
		coreTeam: founders && founders.length > 0 ? founders : null,
		products: null,
	};
	if (format === 'custom-minimal') {
		companyDetails = Object.assign(companyDetails, {
			employeeSize: company.employeeSize ? company.employeeSize : null,
			city: company.city ? company.city : null,
			state: company.state ? company.state : null,
			country: company.country ? company.country : null,
			headquarter: company.city ? `${company.city}${company.state ? `, ${company.state}` : ''}${company.country ? `, ${company.country}` : ''}` : null,
		});
		if (company.productId) {
			const product = {
				id: company.productId,
				name: company.productName,
				type: company.productType,
				description: company.productDescription,
				website: company.productWebsite,
				logo: company.productLogo,
				updatedAt: company.productUpdatedAt,
				sector: company.productSector,
				offers: null,
			};
			if (company.offerId) {
				const offer = {
					id: company.offerId,
					description: company.offerDescription,
					ctaLink: company.offerCTALink,
					ctaText: company.offerCTAText ? company.offerCTAText : 'Visit Website',
					updatedAt: company.offerUpdatedAt,
				};
				product.offers = [offer];
			}
			companyDetails.products = [product];
		}
	} else {
		companyDetails = Object.assign(companyDetails, {
			employeeSize: company.employee_size && company.employee_size.name ? company.employee_size.name : null,
			city: company.headquarteredCity && company.headquarteredCity.cities && company.headquarteredCity.cities.name ? company.headquarteredCity.cities.name : null,
			state: company.headquarteredCity && company.headquarteredCity.cities && company.headquarteredCity.cities.state ? company.headquarteredCity.cities.state : null,
			country: company.headquarteredCity && company.headquarteredCity.cities && company.headquarteredCity.cities.country ? company.headquarteredCity.cities.country : null,
			headquarter: company.headquarteredCity && company.headquarteredCity.cities && company.headquarteredCity.cities.name ? `${company.headquarteredCity.cities.name}${company.headquarteredCity.cities.state ? `, ${company.headquarteredCity.cities.state}` : ''}${company.headquarteredCity.cities.country ? `, ${company.headquarteredCity.cities.country}` : ''}` : null,
		});
	}
	if (parsedMetadata) {
		companyDetails = Object.assign(companyDetails, {
			businessModels: parsedMetadata.businessModels && parsedMetadata.businessModels.length > 0 ? parsedMetadata.businessModels.map((item) => item.name) : null,
			totalFunding: parsedMetadata.totalFunding ? parsedMetadata.totalFunding : null,
			sectors: parsedMetadata.sectors && parsedMetadata.sectors.length > 0 ? parsedMetadata.sectors.map((item) => item.name) : null,
		});
	}
	return companyDetails;
};

module.exports = {
	companyInfo,
	companyProfile,
	companyProfileAlgolia,
	parseCompanyIntroData,
	parseBasicInfoForCompanyTable,
	companyProfileMinimal,
};
