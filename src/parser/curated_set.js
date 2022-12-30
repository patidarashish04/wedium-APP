// curatedSet info
const curatedSetInfo = (curatedSet, format) => {
	if (format === 'minimal') {
		return ({
			key: curatedSet.key,
			value: curatedSet.value,
		});
	}
	return ({
		key: curatedSet.key,
		value: curatedSet.value,
		createdAt: curatedSet.createdAt,
		updatedAt: curatedSet.updatedAt,
	});
};

module.exports = {
	curatedSetInfo,
};
