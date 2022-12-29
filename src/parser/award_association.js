import { awardInfo } from './award';

// awardAssociation info
const awardAssociationInfo = (awardAssociation, format) => {
	if (!awardAssociation || !awardAssociation.award || !awardAssociation.award.id) {
		return null;
	}
	let data = {
		id: awardAssociation.id,
		rank: awardAssociation.rank ? `${awardAssociation.rank < 10 ? '0' : ''}${awardAssociation.rank}` : undefined,
		description: awardAssociation.description ? awardAssociation.description : undefined,
	};
	if (awardAssociation.award && awardAssociation.award.id) {
		data = Object.assign(data, { award: awardInfo(awardAssociation.award, format) });
	}
	return data;
};

module.exports = {
	awardAssociationInfo,
};
