// videoSnippet info
const videoSnippetInfo = ({ videoSnippet }) => {
	const baseObj = {
		id: videoSnippet.id,
		type: videoSnippet.type,
		title: videoSnippet.title,
		thumbnail: videoSnippet.thumbnail,
		videoId: videoSnippet.videoId,
		path: videoSnippet.path,
		videoPlatform: videoSnippet.videoPlatform,
		duration: videoSnippet.duration ? parseInt(videoSnippet.duration) : undefined,
		order: videoSnippet.order,
	};
	return baseObj;
};

module.exports = {
	videoSnippetInfo,
};
