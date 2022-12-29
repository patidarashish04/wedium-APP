import _ from 'lodash';
import cheerio from 'cheerio';

const { getLapsedTime, convertStringToBoolean } = require('../utils/common');
const { getVideoFile } = require('./video');

const seriesLogoGradient = {
	'true-north': 'rgba(248, 248, 88, 0.3)',
	'tech-talk-with-anu': 'rgba(240, 232, 232, 0.3)',
	mavericks: 'rgba(232, 64, 48, 0.3)',
	'up-close': 'rgba(24, 24, 32, 0.3)',
	'in-conversation-with': 'rgba(200, 32, 48, 0.3)',
	'facebook-live-archives': 'rgba(192, 192, 144, 0.3)',
	'through-the-eyes-of-the-investor': 'rgba(120, 120, 112, 0.3)',
	'fabulous-workplaces': 'rgba(0, 160, 152, 0.4)',
};

// series info
const seriesInfo = (series) => ({
	slug: series.slug,
	title: series.title,
	description: getText(series.description),
	order: series.order,
	logoGradient: seriesLogoGradient[series.slug] ? seriesLogoGradient[series.slug] : null,
	metadata: series.series_metadata && series.series_metadata.length > 0 ? series.series_metadata.reduce((obj, item) => {
		obj[item.key === 'thumbnail' ? 'image' : item.key] = item.value; return obj;
	}, {}) : {},
});

// series info v2
const seriesInfoV2 = ({ series, format }) => {
	const baseObj = {
		id: series.id,
		slug: series.slug,
		title: series.title,
		subtitle: series.subtitle,
		description: getText(series.description),
		icon: series.icon,
		logoGradient: seriesLogoGradient[series.slug] ? seriesLogoGradient[series.slug] : null,
		path: `/series/${series.slug}`,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	baseObj.episode_count = series.episode_count;
	baseObj.overview = series.overview;
	baseObj.banner = series.banner;
	baseObj.featured = series.featured;
	baseObj.order = series.order;
	baseObj.metadata = {};
	if (series.series_metadata && series.series_metadata.length > 0) {
		baseObj.metadata = {
			facebook: {},
			twitter: {},
			generic: {},
			cta: {},
			trailers: [],
		};
		_.forEach(series.series_metadata, (item) => {
			switch (item.key) {
			case 'facebookExcerpt':
				baseObj.metadata.facebook.excerpt = item.value;
				return;
			case 'facebookMedia':
				baseObj.metadata.facebook.media = item.value;
				return;
			case 'facebookTitle':
				baseObj.metadata.facebook.title = item.value;
				return;
			case 'genericExcerpt':
				baseObj.metadata.generic.excerpt = item.value;
				return;
			case 'genericMedia':
				baseObj.metadata.generic.media = item.value;
				return;
			case 'genericTitle':
				baseObj.metadata.generic.title = item.value;
				return;
			case 'twitterExcerpt':
				baseObj.metadata.twitter.excerpt = item.value;
				return;
			case 'twitterMedia':
				baseObj.metadata.twitter.media = item.value;
				return;
			case 'twitterTitle':
				baseObj.metadata.twitter.title = item.value;
				return;
			case 'thumbnail':
			case 'image':
				baseObj.metadata.thumbnail = item.value;
				return;
			case 'eCtaTitle':
				baseObj.metadata.cta.title = item.value;
				return;
			case 'eCtaLink':
				baseObj.metadata.cta.link = item.value;
				return;
			case 'removeAds':
				baseObj.metadata.removeAds = convertStringToBoolean(item.value);
				return;
			case 'sponsoredStory':
				baseObj.metadata.sponsoredStory = convertStringToBoolean(item.value);
				return;
			case 'trailer': {
				const trailerJson = JSON.parse(item.value);
				baseObj.metadata.trailers.push({ ...trailerJson, mediaLink: getVideoFile(trailerJson.mediaPlatform, trailerJson.mediaId), order: item.order });
				break;
			}
			default:
				break;
			}
		});
	}
	return baseObj;
};

const getText = (htmlText) => {
	const $ = cheerio.load(htmlText);
	return $.text();
};

const parseSeriesInfo = (combinedData) => {
	if (!combinedData) {
		return null;
	}
	const seriesData = {};
	_.forEach(combinedData, (item) => {
		if (item.content && item.content.length > 0) {
			seriesData.content = item.content;
		} if (item.info) {
			const {
				id, title, slug, description, publishedAt, series_metadata,
			} = item.info;
			seriesData.info = {
				id,
				title,
				description,
				path: `/series/${slug}`,
				timeLapsed: getLapsedTime(publishedAt),
			};
			if (series_metadata && series_metadata.length > 0) {
				seriesData.metadata = {
					facebook: {},
					twitter: {},
					generic: {},
					cta: {},
				};
				_.forEach(series_metadata, (item) => {
					switch (item.key) {
					case 'facebookExcerpt':
						seriesData.metadata.facebook.excerpt = item.value;
						return;
					case 'facebookMedia':
						seriesData.metadata.facebook.media = item.value;
						return;
					case 'facebookTitle':
						seriesData.metadata.facebook.title = item.value;
						return;
					case 'genericExcerpt':
						seriesData.metadata.generic.excerpt = item.value;
						return;
					case 'genericMedia':
						seriesData.metadata.generic.media = item.value;
						return;
					case 'genericTitle':
						seriesData.metadata.generic.title = item.value;
						return;
					case 'twitterExcerpt':
						seriesData.metadata.twitter.excerpt = item.value;
						return;
					case 'twitterMedia':
						seriesData.metadata.twitter.media = item.value;
						return;
					case 'twitterTitle':
						seriesData.metadata.twitter.title = item.value;
						return;
					case 'thumbnail':
					case 'image':
						seriesData.info.thumbnail = item.value;
						return;
					case 'eCtaTitle':
						seriesData.metadata.cta.title = item.value;
						return;
					case 'eCtaLink':
						seriesData.metadata.cta.link = item.value;
						return;
					case 'removeAds':
						seriesData.metadata.removeAds = convertStringToBoolean(item.value);
						return;
					case 'sponsoredStory':
						seriesData.metadata.sponsoredStory = convertStringToBoolean(item.value);
						break;
					default:
						break;
					}
				});
			}
		}
	});
	return seriesData;
};

module.exports = {
	seriesInfo,
	seriesInfoV2,
	parseSeriesInfo,
	getText,
};
