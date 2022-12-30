const timelineForProfile = (milestone) => {
	if (!milestone || !milestone.milestoneType) {
		return null;
	}
	return {
		typeId: milestone.curated_list.id,
		id: milestone.id,
		milestoneDate: milestone.date,
		milestoneDateFormat: milestone.dateFormat,
		name: milestone.curated_list.name,
		image: milestone.curated_list.image && milestone.curated_list.image.url,
		description: milestone.description,
		url: null,
	};
};

const timelineForUpdates = (data, companyId) => ({
	date: data.date,
	dateFormat: data.dateFormat ? data.dateFormat : 'DATE',
	milestoneType: data.milestoneType,
	description: data.description,
	companyId: data.companyId ? data.companyId : companyId,
	id: data.id,
});
module.exports = {
	timelineForProfile,
	timelineForUpdates,
};
