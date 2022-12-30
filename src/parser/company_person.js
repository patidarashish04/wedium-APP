const { influencerInfo, influencerInfoForProfile } = require('./influencer');
const { companyInfo } = require('./company');
const { getFormattedDate } = require('../utils/common');

// companyPerson info
const companyPersonInfo = (companyPerson, format) => {
	if (!companyPerson || !companyPerson.id) {
		return null;
	}
	let data = {
		id: companyPerson.id,
		// influencerId: companyPerson.influencerId,
		// companyId: companyPerson.companyId,
		role: companyPerson.role,
		designation: companyPerson.designation,
		startDate: companyPerson.startDate ? getFormattedDate(companyPerson.startDate, companyPerson.startDateFormat) : null,
		endDate: companyPerson.endDate ? getFormattedDate(companyPerson.endDate, companyPerson.endDateFormat) : null,
	};
	if (companyPerson.influencerProfile && companyPerson.influencerProfile.id) {
		data = Object.assign(data, { influencer: influencerInfo(companyPerson.influencerProfile, format) });
	}
	if (companyPerson.company && companyPerson.company.id) {
		data = Object.assign(data, { company: companyInfo(companyPerson.company, format) });
	}
	return data;
};

const companyPersonForProfile = (companyPerson) => {
	if (!companyPerson || !companyPerson.influencerId) {
		return null;
	}
	let data = {
		influencerId: companyPerson.influencerId,
		id: companyPerson.id,
		role: companyPerson.role,
		designation: companyPerson.designation,
	};
	if (companyPerson.influencerProfile && companyPerson.influencerProfile.id) {
		data = Object.assign(data, influencerInfoForProfile(companyPerson.influencerProfile));
	}
	return data;
};

const companyPersonForUpdates = (personData, companyId) => {
	if (personData) {
		if (!personData.updateId && !personData.id && !(personData.status && personData.status === 'DELETED')) {
			if (personData.name && personData.designation) {
				return {
					name: personData.name,
					designation: personData.designation,
					linkedInUrl: personData.linkedInUrl ? personData.linkedInUrl : null,
					image: personData.image ? personData.image : null,
				};
			}
			return null;
		} if (personData.updateId || personData.id) {
			if (personData.name) {
				return {
					influencerId: personData.influencerId,
					designation: personData.designation ? personData.designation : null,
					role: personData.role ? personData.role : null,
					image: personData.image ? personData.image : null,
					linkedInUrl: personData.linkedInurl ? personData.linkedInUrl : null,
					companyId,
				};
			}
			return null;
		}
	}
};

module.exports = {
	companyPersonInfo,
	companyPersonForProfile,
	companyPersonForUpdates,
};
