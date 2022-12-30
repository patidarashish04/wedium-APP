import _ from 'lodash';
import logger from '../utils/logger';

const { getLapsedTime, convertSecondsToISO8601, convertStringToBoolean } = require('../utils/common');

// video info
const videoInfo = (video, format) => {
	if (format === 'minimal') {
		return ({
			key: video.key,
			title: video.title,
			slug: video.slug,
			description: video.description ? video.description : undefined,
			publishedAt: video.publishedAt,
			duration: video.duration,
			series: video.series ? video.series : undefined,
			image: video.image ? video.image : undefined,
			tags: video.tags ? video.tags : undefined,
			link: getVideoFile(video.type, video.key),
			path: `/video/${video.slug}`,
		});
	}
	return ({
		key: video.key,
		id: video.id,
		title: video.title,
		slug: video.slug,
		description: video.description ? video.description : undefined,
		publishedAt: video.publishedAt,
		duration: video.duration,
		series: video.series ? video.series : undefined,
		image: video.image ? video.image : undefined,
		type: video.type ? video.type : undefined,
		meta: video.meta ? video.meta : undefined,
		tags: video.tags ? video.tags : undefined,
		link: getVideoFile(video.type, video.key),
		path: `/video/${video.slug}`,
	});
};

// video info app
const videoInfoApp = (video) => ({
	post_title: video.title,
	post_name: video.slug,
	excerpt: video.description ? video.description : '',
	post_date: (new Date(video.publishedAt)).getTime(),
	iframe_image: video.image ? video.image : '',
	video_link: `https://www.youtube.com/watch?v=${video.key}`,
	author: {
		display_name: 'Team YS',
	},
	post_link: `/video/${video.slug}`,
});

function getVideoFile(type, key) {
	if (type === 'jwplayer') {
		return `https://cdn.jwplayer.com/manifests/${key}.m3u8`;
	} if (type === 'youtube') {
		return `https://www.youtube.com/embed/${key}?rel=0`;
	}
	return null;
}

const parseDetails = (combinedData) => {
	if (!combinedData) {
		return null;
	}
	let videoData = {};
	// parse combined data into a response like
	/**
	 * {
	 * 		video : {},
	 * 		related : {},
	 *    trending : {}
	 * 		brandInfo: {}
	 * }
	 *  */
	_.forEach(combinedData, (item) => {
		if (item.details) {
			let {
				postContent,
			} = item.details;
			const {
				id, title, subtitle, type, publishedUrl, status, publishedAt, layout, imported, featured, story_metadata, content_reaction, brandInfo, mediaId, videoPlatform, series, series_metadata,
			} = item.details;
			const brand = {
				id: brandInfo.id, name: brandInfo.name, slug: brandInfo.slug, locale: brandInfo.locale, internal: brandInfo.internal,
			};
			try {
				postContent = JSON.parse(postContent);
			} catch (e) {
				logger.error('Parsing postContent', e);
			}

			if (brand.id === 2) {
				brand.path = '/';
			} else {
				brand.path = `/${brand.slug}`;
			}
			if (series && series_metadata && series_metadata.length > 0) {
				const seriesInfo = {
					id: series.id,
					title: series.title,
					description: series.description,
					path: `/series/${series.slug}`,
				};
				const thumbnailObj = _.filter(series_metadata, (item) => (item.get('key') === 'thumbnail' || item.get('key') === 'image'));
				if (thumbnailObj && thumbnailObj.length > 0) {
					seriesInfo.thumbnail = thumbnailObj[0].dataValues.value;
				}
				videoData.series = seriesInfo;
			}

			const timeLapsed = getLapsedTime(publishedAt); // calculate timelapsed
			const metadata = {
				facebook: {},
				generic: {},
				twitter: {},
				disableComments: false,
				hasInstagramEmbeds: false,
				hasSoundCloudEmbeds: false,
				hasTwitterEmbeds: false,
			};
			videoData = {
				...videoData,
				id,
				mediaId,
				videoPlatform,
				title,
				subtitle,
				path: publishedUrl,
				publishedAt,
				status,
				type,
				postContent,
				layout,
				featured,
				imported,
				timeLapsed,
				brand: brandInfo,
				engagement: {},
			};
			if (content_reaction) {
				videoData.engagement.shares = content_reaction.fb_share_count + content_reaction.linkedin_share_count + content_reaction.twitter_share_count;
				videoData.engagement.bookmarks = content_reaction.bookmark_count;
			}
			_.forEach(story_metadata, (item) => {
				const { key, value } = item;
				if (key === 'disableComments') {
					metadata.disableComments = convertStringToBoolean(value);
				} else if (key === 'locale') {
					metadata.locale = value;
				} else if (key === 'videoDuration') {
					metadata.duration = parseInt(value);
					metadata.duration_iso = convertSecondsToISO8601(metadata.videoDuration);
				} else if (key === 'thumbnail') {
					metadata.thumbnail = value;
				} else if (key === 'facebookMedia') {
					metadata.facebook.media = value;
				} else if (key === 'twitterMedia') {
					metadata.twitter.media = value;
				} else if (key === 'genericMedia') {
					metadata.generic.media = value;
				} else if (key === 'facebookExcerpt') {
					metadata.facebook.excerpt = value;
				} else if (key === 'genericExcerpt') {
					metadata.generic.excerpt = value;
				} else if (key === 'twitterExcerpt') {
					metadata.twitter.excerpt = value;
				} else if (key === 'facebookTitle') {
					metadata.facebook.title = value;
				} else if (key === 'twitterTitle') {
					metadata.twitter.title = value;
				} else if (key === 'genericTitle') {
					metadata.generic.title = value;
				} else if (key === 'plainText') {
					metadata.plainText = value;
				} else if (key === 'hasInstagramEmbeds"') {
					metadata.hasInstagramEmbeds = convertStringToBoolean(value);
				} else if (key === 'hasSoundCloudEmbeds') {
					metadata.hasSoundCloudEmbeds = convertStringToBoolean(value);
				} else if (key === 'hasTwitterEmbeds') {
					metadata.hasTwitterEmbeds = convertStringToBoolean(value);
				} else if (key === 'removeAds') {
					metadata.removeAds = convertStringToBoolean(value);
				} else if (key === 'sponsoredStory') {
					metadata.sponsoredStory = convertStringToBoolean(value);
				} else if (key === 'canonicalUrl') {
					metadata.canonicalUrl = value;
				}
			});
			videoData.metadata = metadata;
		} else if (item.related && item.related.length > 0) {
			videoData.related = item.related;
		} else if (item.latest) {
			videoData.latest = item.latest;
		} else if (item.trending) {
			videoData.trending = item.trending;
		} else if (item.authors) {
			if (!item.authors.visibility) {
				delete item.authors.facebook_url;
				delete item.authors.linkedin_url;
				delete item.authors.twitter_url;
			}
			if (videoData.metadata) {
				videoData.metadata.authors = item.authors;
			}
		} else if (item.redirected) {
			if (item.redirected.toUrl) {
				videoData.redirected = item.redirected.toUrl;
			}
		} else if (item.category && item.category.length > 0) {
			videoData.metadata.category = item.category[0];
		} else if (item.brandSpotlight && item.brandSpotlight.length > 0) {
			videoData.metadata.brandSpotlight = item.brandSpotlight[0];
		} else if (item.tags && item.tags.length > 0) {
			videoData.metadata.tags = item.tags;
		} else if (item.adjacent && item.adjacent.length > 0) {
			videoData.adjacentStories = item.adjacent;
		}
	});
	if (videoData.metadata && (!videoData.metadata.canonicalUrl || videoData.metadata.canonicalUrl.trim().length === 0)) {
		videoData.metadata.canonicalUrl = process.env.SERVICE_PWA + videoData.path;
	}
	if (!videoData.related || videoData.related.length === 0) {
		videoData.related = videoData.latest;
		delete videoData.latest;
	}
	if (videoData.related && videoData.related.length > 0) {
		videoData.related = videoData.related.map((story) => {
			const parsed = {
				...story,
				timeLapsed: getLapsedTime(story.publishedAt),
			};
			delete parsed.publishedUrl;
			delete parsed.publishedAt;
			return parsed;
		});
	}
	// if video has brand spotlight show no ads
	if (videoData.metadata) {
		if (videoData.metadata.brandSpotlight && videoData.metadata.brandSpotlight.path) {
			videoData.metadata.removeAds = true;
		} else if (videoData.metadata.sponsoredStory) {
			// if video is sponsored story show no ads
			videoData.metadata.removeAds = true;
		}
	}

	return videoData;
};

const parseMinimalList = (data) => {
	if (data && data.length > 0) {
		return data.map((story) => {
			const {
				id, title, publishedUrl, publishedAt, subtitle, brand, seriesId, seriesTitle, seriesPath, thumbnail, viewCount, type,
			} = story;
			let series = null;
			if (seriesId) {
				series = {
					id: seriesId,
					title: seriesTitle,
					path: seriesPath,
				};
			}
			return {
				id,
				title,
				path: publishedUrl,
				timeLapsed: getLapsedTime(publishedAt),
				subtitle,
				brand,
				series,
				viewCount,
				thumbnail,
				type,
			};
		});
	}
	return null;
};

const parseVideoHomePage = (combinedData) => {
	if (!combinedData) {
		return null;
	}
	const parsedData = {};
	_.forEach(combinedData, (item) => {
		if (item.latest) {
			const latest = item.latest.map((story) => {
				const {
					id, title, publishedUrl, publishedAt, subtitle, thumbnail, type, featured,
				} = story;
				return {
					id,
					title,
					path: publishedUrl,
					timeLapsed: getLapsedTime(publishedAt),
					subtitle,
					thumbnail,
					type,
					featured,
				};
			});
			parsedData.latest = latest;
		} else if (item.featured) {
			const featured = [];
			item.featured.forEach((series) => {
				let processedSeries = {};
				const {
					id, slug, description, series_metadata, stories, title,
				} = series;
				const thumbnail = series_metadata && series_metadata.length > 0 ? series_metadata[0].value : null;
				processedSeries = {
					id,
					title,
					path: `/series/${slug}`,
					description,
					thumbnail,
				};
				processedSeries.content = stories.map((story) => {
					const {
						id, title, publishedUrl, publishedAt, subtitle, type, featured,
					} = story;
					const thumbnail = story.story_metadata && story.story_metadata.length > 0 ? story.story_metadata[0].value : null;
					return {
						id,
						title,
						subtitle,
						path: publishedUrl,
						timeLapsed: getLapsedTime(publishedAt),
						thumbnail,
						type,
						featured,
					};
				});
				if (processedSeries.content && processedSeries.content.length > 0) {
					featured.push(processedSeries);
				}
			});
			if (featured.length > 0) {
				parsedData.featured = featured;
			}
		}
	});
	return parsedData;
};

module.exports = {
	videoInfo,
	videoInfoApp,
	parseDetails,
	parseMinimalList,
	parseVideoHomePage,
	getVideoFile,
};
