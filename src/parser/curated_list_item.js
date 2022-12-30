// curatedListItem info
const curatedListItemInfo = ({ curatedListItem, format }) => {
	const baseObj = {
		id: curatedListItem.id,
		slug: curatedListItem.slug,
		name: curatedListItem.name,
		type: curatedListItem.type,
		label: curatedListItem.label,
		path: curatedListItem.slug && curatedListItem.type === 'YSTV-CATEGORY' ? `/ystv/category/${curatedListItem.slug}` : undefined,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return Object.assign(baseObj, {
		description: curatedListItem.description ? curatedListItem.description : undefined,
		image: curatedListItem.image ? curatedListItem.image : undefined,
		subtitle: curatedListItem.label ? curatedListItem.label : undefined,
		title: curatedListItem.name ? curatedListItem.name : undefined,
		banner: curatedListItem.image && curatedListItem.image.banner ? curatedListItem.image.banner : null,
		icon: curatedListItem.image && curatedListItem.image.icon ? curatedListItem.image.icon : null,
	});
};

module.exports = {
	curatedListItemInfo,
};
