// story info
const storyInfo = (story, format) => {
	if (format === 'minimal') {
		return ({
			id: story.id,
			title: story.title,
			slug: story.slug,
			type: story.type,
			subtitle: story.subtitle ? story.subtitle : undefined,
			publishedAt: story.publishedAt,
			updatedAt: story.updatedAt,
		});
	}
	let postContent = story.postContent;
	try {
		postContent = JSON.parse(story.postContent);
	} catch (e) {
		console.log(e);
	}
	return ({
		id: story.id,
		title: story.title,
		slug: story.slug,
		subtitle: story.subtitle ? story.subtitle : undefined,
		publishedAt: story.publishedAt,
		updatedAt: story.updatedAt,
		type: story.type,
		imported: story.imported,
		postContent,
		protected: story.protected ? story.protected : undefined,
		layout: story.layout,
	});
};

module.exports = {
	storyInfo,
};
