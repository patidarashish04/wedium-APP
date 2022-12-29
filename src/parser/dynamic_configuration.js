// dynamicConfiguration info
const dynamicConfigurationInfo = (dynamicConfiguration) => ({
	id: dynamicConfiguration.id,
	key: dynamicConfiguration.key,
	title: dynamicConfiguration.title,
	value: dynamicConfiguration.value,
	description: dynamicConfiguration.description,
	namespace: dynamicConfiguration.namespace,
	createdAt: dynamicConfiguration.createdAt,
	updatedAt: dynamicConfiguration.updatedAt,
});

module.exports = {
	dynamicConfigurationInfo,
};
