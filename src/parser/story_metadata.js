// storymeta info
const storyMetaInfo = ({ storymeta, format, storyType }) => {
	let speakers;
	let portraitThumbnail;
	let landscapeThumbnail = storymeta.thumbnail ? storymeta.thumbnail : null;
	const defaultThumbnail = storymeta.thumbnail ? storymeta.thumbnail : null;
	if (['WEBINAR', 'VIDEO'].includes(storyType)) {
		if (storymeta.portraitThumbnail) {
			portraitThumbnail = `${storymeta.portraitThumbnail}?fm=png&ar=3:4&mode=crop&crop=faces`;
		} else if (landscapeThumbnail) {
			portraitThumbnail = `${landscapeThumbnail}?fm=png&ar=3:4&mode=crop&crop=faces`;
		}
		if (landscapeThumbnail) {
			landscapeThumbnail = `${landscapeThumbnail}?fm=png&ar=2:1&mode=crop&crop=faces`;
		}
		speakers = storymeta.speakers ? storymeta.speakers : undefined;
	}
	if (format === 'minimal') {
		return ({
			authors: storymeta.authors,
			category: storymeta.category,
			excerpt: storymeta.genericExcerpt ? storymeta.genericExcerpt : undefined,
			media: storymeta.genericMedia ? storymeta.genericMedia : undefined,
			thumbnailMediaId: storymeta.thumbnailMediaId || undefined,
			thumbnailPlatform: storymeta.thumbnailPlatform || undefined,
			thumbnail: landscapeThumbnail,
			portraitThumbnail,
			defaultThumbnail,
			brandSpotlight: storymeta.brandSpotlight,
			removeAds: storymeta.removeAds,
			series: storymeta.series ? storymeta.series : undefined,
			speakers,
			curatedCategories: storymeta.curatedCategories ? storymeta.curatedCategories : undefined,
			sponsoredStory: storymeta.sponsoredStory,
			isRegistrationRequired: storymeta.isRegistrationRequired,
			duration: storymeta.videoDuration,
			timeToRead: storymeta.timeToRead ? Number(storymeta.timeToRead) : null,
			reactions: storymeta.reactions,
			articleTopics: storymeta.articleTopics,
			richArticleTopics: storymeta.richArticleTopics,
			storyFormat: storymeta?.storyFormat,
			tags: storymeta.tags,
			featuredImage: storymeta.featuredImage,
		});
	}
	return ({
		authors: storymeta.authors,
		brandSpotlight: storymeta.brandSpotlight,
		canonicalUrl: storymeta.canonicalUrl,
		category: storymeta.category,
		facebook: {
			excerpt: storymeta.facebookExcerpt ? storymeta.facebookExcerpt : undefined,
			media: storymeta.facebookMedia ? storymeta.facebookMedia : undefined,
			title: storymeta.facebookTitle ? storymeta.facebookTitle : undefined,
		},
		generic: {
			excerpt: storymeta.genericExcerpt ? storymeta.genericExcerpt : undefined,
			media: storymeta.genericMedia ? storymeta.genericMedia : undefined,
			title: storymeta.genericTitle ? storymeta.genericTitle : undefined,
			keywords: storymeta.genericKeywords ? storymeta.genericKeywords : undefined,
		},
		twitter: {
			excerpt: storymeta.twitterExcerpt ? storymeta.twitterExcerpt : undefined,
			media: storymeta.twitterMedia ? storymeta.twitterMedia : undefined,
			title: storymeta.twitterTitle ? storymeta.twitterTitle : undefined,
		},
		duration: storymeta.videoDuration,
		banner: storymeta.banner ? storymeta.banner : null,
		parallaxBanner: storymeta.parallaxBanner ? storymeta.parallaxBanner : false,
		locale: storymeta.locale,
		tags: storymeta.tags,
		timeToRead: storymeta.timeToRead ? Number(storymeta.timeToRead) : null,
		plainText: storymeta.plainText,
		hasInstagramEmbeds: storymeta.hasInstagramEmbed,
		hasSoundCloudEmbeds: storymeta.hasSoundCloudEmbed,
		hasTwitterEmbeds: storymeta.hasTwitterEmbed,
		removeAds: storymeta.removeAds,
		sponsoredStory: storymeta.sponsoredStory,
		isRegistrationRequired: storymeta.isRegistrationRequired,
		storyUrl: storymeta.storyUrl,
		thumbnailMediaId: storymeta.thumbnailMediaId || undefined,
		thumbnailPlatform: storymeta.thumbnailPlatform || undefined,
		thumbnail: landscapeThumbnail,
		portraitThumbnail,
		defaultThumbnail,
		reactions: storymeta.reactions,
		audioFile: storymeta.audioFile ? storymeta.audioFile : undefined,
		guestAuthor: storymeta.guestAuthor,
		series: storymeta.series ? storymeta.series : undefined,
		sponsors: storymeta.sponsors ? storymeta.sponsors : undefined,
		speakers: storymeta.speakers ? storymeta.speakers : undefined,
		moderators: storymeta.moderators ? storymeta.moderators : undefined,
		curatedTags: storymeta.curatedTags ? storymeta.curatedTags : undefined,
		curatedCategories: storymeta.curatedCategories ? storymeta.curatedCategories : undefined,
		editors: storymeta.editors ? storymeta.editors : undefined,
		articleTopics: storymeta.articleTopics,
		richArticleTopics: storymeta.richArticleTopics,
		storyFormat: storymeta?.storyFormat,
	});
};

module.exports = {
	storyMetaInfo,
};
