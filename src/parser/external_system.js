// externalSystem info
const externalSystemInfo = (externalSystem, format) => {
	if (format === 'minimal') {
		return ({
			key: externalSystem.key,
			value: externalSystem.value,
		});
	}
	return ({
		_id: externalSystem._id,
		key: externalSystem.key,
		value: externalSystem.value,
		created_at: externalSystem.created_at,
		updated_at: externalSystem.updated_at,
	});
};

module.exports = {
	externalSystemInfo,
};
