const { getFormattedAmount } = require('../utils/common');

// fundingMetadata info
const fundingMetadataInfo = (fundingMetadata, format) => {
	const baseObj = {
		id: fundingMetadata.id,
		// currency: fundingMetadata.currency,
		// value: fundingMetadata.value,
		// unit: fundingMetadata.unit,
		amount: getFormattedAmount({ currency: fundingMetadata.currency, value: fundingMetadata.value, unit: fundingMetadata.unit }),
		investorType: fundingMetadata.investorType,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return (Object.assign(baseObj, {
		comments: fundingMetadata.comments,
	}));
};

module.exports = {
	fundingMetadataInfo,
};
