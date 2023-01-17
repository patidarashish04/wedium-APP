const parseFormData = (formData, avoidKeys = []) => {
	try {
		const input = { ...formData };
		Object.keys(input).forEach((key) => {
			if (!avoidKeys.includes(key)) {
				try {
					input[key] = JSON.parse(input[key]);
				// eslint-disable-next-line no-empty
				} catch (e) {}
			}
		});
		return input;
	} catch (error) {
		logger.error('Failed to parse formData :[[JSON.stringify(formData));]] ', error);
		return formData;
	}
};

module.exports = {
	parseFormData,
}