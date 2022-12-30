import { isCompanyPublishedOrVerified } from '../services/Companies/functions';

const isUUID = require('is-uuid');

// companyLocation info
const companyLocationInfo = (companyLocation, format) => {
	if (!companyLocation || !companyLocation.cities || !companyLocation.cities.id) {
		return null;
	}
	const baseObj = {
		id: companyLocation.id,
		// cityId: companyLocation.cities.id,
		city: companyLocation.cities.name,
		state: companyLocation.cities.state,
		country: companyLocation.cities.country,
		slug: companyLocation.cities.slug,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return (Object.assign(baseObj, {
		googleMapLink: companyLocation.googleMapLink,
		latitude: companyLocation.latitude,
		logitude: companyLocation.logitude,
		pincode: companyLocation.pincode,
		addressLine1: companyLocation.addressLine1,
		addressLine2: companyLocation.addressLine2,
		employeeCount: companyLocation.employeeCount,
	}));
};

const companyLocationForProfile = (companyLocation) => {
	if (!companyLocation || !companyLocation.cities || !companyLocation.cities.id) {
		return null;
	}
	return {
		id: companyLocation.id ? companyLocation.id : undefined,
		updatedId: companyLocation.updatedId ? companyLocation.updatedId : undefined,
		cityId: companyLocation.cities.id,
		city: companyLocation.cities.name,
		state: companyLocation.cities.state,
		country: companyLocation.cities.country,
		pincode: companyLocation.pincode,
		addressLine1: companyLocation.addressLine1,
		addressLine2: companyLocation.addressLine2,
		employeeCount: companyLocation.employeeCount,
		googleMapLink: companyLocation.googleMapLink,
		headquarters: companyLocation.headquarters,
	};
};

const companyLocationForUpdates = (companyLocation, companyId, companyStatus = null) => {
	let locationObject = {};
	const failed = false;
	if (!companyLocation.cityId || !isUUID.anyNonNil(companyLocation.cityId)) {
		return { failed: true, data: null };
	}
	locationObject = {
		city: companyLocation.cityId && companyLocation.cityId,
		latitude: companyLocation.latitude ? companyLocation.latitude : null,
		longitude: companyLocation.longitude ? companyLocation.longitude : null,
		googleMapLink: companyLocation.googleMapLink ? companyLocation.googleMapLink : null,
		pincode: companyLocation.pincode ? companyLocation.pincode : null,
		addressLine1: companyLocation.addressLine1 ? companyLocation.addressLine1 : null,
		addressLine2: companyLocation.addressLine2 ? companyLocation.addressLine2 : null,
		employeeCount: companyLocation.employeeCount ? Number(companyLocation.employeeCount) : null,
		phoneNo: companyLocation.phoneNo ? companyLocation.phoneNo : null,
		companyId,
	};
	if (isCompanyPublishedOrVerified(companyStatus) && companyLocation.headquarters) {
		locationObject.headquarters = companyLocation.headquarters ? companyLocation.headquarters : undefined;
	}
	return { failed, data: locationObject };
};

module.exports = {
	companyLocationInfo,
	companyLocationForProfile,
	companyLocationForUpdates,
};
