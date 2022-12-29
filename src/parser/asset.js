// get story ids from assets
const storyIdsFromAssets = (assets) => {
	const storyIds = assets.map((asset) => asset.usedIn);
	return storyIds;
};

// get stories with thumbnail for asset used in
const storiesWithThumbnail = (stories, metaThumbails) => {
	const output = stories.map((story) => {
		const meta = metaThumbails.reduce((acc, curr) => {
			if (curr.story_id === story.id) {
				acc = curr;
			}
			return acc;
		}, {});
		const data = {
			id: story.id,
			title: story.title,
			updatedAt: story.updatedAt,
			publishedUrl: story.publishedUrl,
			thumbnail: meta.value,
		};
		return data;
	});
	return output;
};

export { storyIdsFromAssets, storiesWithThumbnail };
