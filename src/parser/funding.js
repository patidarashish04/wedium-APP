const {
	getFormattedDate, getFormattedAmount, getCurrencyUnitValue, getAmountAsNumber,
} = require('../utils/common');

// funding info
const fundingInfo = (funding, format) => {
	const baseObj = {
		id: funding.id,
		name: funding.name,
		round: funding.round,
		// currency: funding.currency,
		// value: funding.value,
		// unit: funding.unit,
		amount: getFormattedAmount({ currency: funding.currency, value: funding.value, unit: funding.unit }),
		fundingDate: funding.fundingDate ? getFormattedDate(funding.fundingDate, funding.fundingDateFormat) : null,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return (Object.assign(baseObj, {
		description: funding.description,
	}));
};

const fundingForProfile = (funding) => {
	const baseObj = {
		id: funding.id,
		round: funding.round,
		amount: getFormattedAmount({ currency: funding.currency, value: funding.value, unit: funding.unit }),
		fundingDate: funding.fundingDate ? getFormattedDate(funding.fundingDate, funding.fundingDateFormat) : null,
		date: funding.fundingDate,
		fundingAmountInNumber: getAmountAsNumber(funding.value, funding.unit),
		fundingCurrency: funding.currency,
		metadata: funding.metadata,
	};
	return baseObj;
};

const fundingForUpdates = (data, companyId) => {
	let fundingAmount = null;

	if (data.amount) fundingAmount = getCurrencyUnitValue(data.amount);

	return {
		id: data.id ? data.id : undefined,
		updateId: data.updateId ? data.updateId : undefined,
		round: data.round,
		fundingDate: data.fundingDate,
		fundingDateFormat: 'DATE',
		currency: data.amount ? data.currency ? data.currency : 'USD' : null,
		unit: data.amount ? fundingAmount.unit : null,
		value: data.amount ? fundingAmount.value : null,
		companyId,
	};
};

module.exports = {
	fundingInfo,
	fundingForProfile,
	fundingForUpdates,
};
