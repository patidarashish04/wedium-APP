const parseStringifiedNull = (body) => {
	const input = { ...body };
	Object.keys(input).forEach((key) => {
		if (['null', 'undefined', ''].includes(input[key])) {
			input[key] = null;
		}
	});
	return input;
};

export { parseStringifiedNull };
