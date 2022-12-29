import logger from './logger';

const cheerio = require('cheerio');
const validUrl = require('valid-url');
const moment = require('moment');
const _ = require('lodash');
const AmpOptimizer = require('@ampproject/toolbox-optimizer');
const { computeShareCount } = require('../services/StoryMetadata/functions');
const {
	getTagPath, getCategoryPath, getAuthorPath, getBrandPath,
} = require('./story');
const { arrayToObject, convertSecondsToISO8601, getReadableCount } = require('./common');
const { brandsData } = require('./constants');
const { secondsToHhmmss } = require('./utility_function');

const parser = require('../parser/index');
const { accessPaidContent } = require('./userAccess');

const { companyById, companySectors } = require('../services/Companies/functions');
const { companyPeopleByCompanyId } = require('../services/CompanyPeople/functions');

const SERVICE_PWA = process.env.SERVICE_PWA;

const formatStoryAmp = async (story, metadata, brand, storyAssets, series, contentReactionsData, inArticleAdConfig = { first_ad_insert_word_limit: 50, ad_insert_word_limit: 100 }, connectCompany, userId = null) => {
	const brandObject = parser.brand.brandInfo(brand);
	brandObject.path = getBrandPath(brand.slug);
	const metaObject = parser.storyMeta.storyMetaInfo({ storymeta: metadata });
	const showAds = (!(metaObject.removeAds || metaObject.sponsoredStory || brand.slug === 'journal') && (story.type !== 'VIDEO') && (story.type !== 'WEBINAR'));
	const isCompanyConnectAvailable = connectCompany && connectCompany.length === 1 && connectCompany[0] && connectCompany[0].id;
	if (metaObject.tags && metaObject.tags.length > 0) {
		const tagMeta = metaObject.tags.filter((e) => e).map((item) => ({ ...parser.tag.tagInfo(item), path: getTagPath(brandObject.slug, item.slug) }));
		metaObject.tags = tagMeta;
	} else {
		metaObject.tags = [];
	}
	if (metaObject.authors && metaObject.authors.length > 0) {
		const authorMeta = metaObject.authors.filter((e) => e).map((item) => ({ ...parser.authorMeta.authorMetaInfo(item), path: getAuthorPath(item.username) }));
		metaObject.authors = authorMeta;
	} else {
		metaObject.authors = [];
	}
	if (metaObject.brandSpotlight) {
		metaObject.brandSpotlight = parser.brandSpotlight.brandSpotlightInfo(metaObject.brandSpotlight);
	}
	if (metaObject.category) {
		metaObject.category = { ...parser.category.categoryInfo(metaObject.category), path: getCategoryPath(brandObject.slug, metaObject.category.slug) };
	} else if (brandObject.slug !== 'herstory' && brandObject.slug !== 'socialstory' && brandObject.slug !== 'mystory' && brandObject.slug !== 'smbstory' && brandObject.slug !== 'germany' && brandObject.slug !== 'journal' && brandObject.slug !== 'hindi' && brandObject.slug !== 'tamil' && brandObject.slug !== 'korea' && brandObject.slug !== 'weekender') {
		metaObject.category = brandObject;
	}
	if (metaObject.duration) {
		metaObject.duration = parseInt(metaObject.duration);
		metaObject.duration_iso = convertSecondsToISO8601(metaObject.duration);
	}
	const adTarget = {
		brand: brandObject?.name || 'YourStory',
		path: story.publishedUrl,
		adCategory: metaObject?.category?.name || 'Default',
		adTags: metaObject?.tags?.length > 0 ? metaObject.tags.map((i) => i.name) : ['Default'],
	};
	const storyObject = parser.story.storyInfo(story);
	const ampData = await getAmpContent(storyObject.id, storyObject.postContent, adTarget, showAds, storyAssets, metaObject.guestAuthor, metaObject.editors, inArticleAdConfig, isCompanyConnectAvailable ? {
		id: connectCompany[0].id,
		slug: connectCompany[0].slug,
		name: connectCompany[0].name,
	} : null, metadata.storyUrl, brandObject);
	let hasAccessToRead = !story.protected;
	if (story.protected) {
		let access = false;
		try {
			access = await accessPaidContent(userId, 'login');
		} catch (error) {
			logger.error(`Error fetching user access for story: [${story.id}], user: [${userId}]`, error);
			access = false;
		}
		if (access) hasAccessToRead = true;
	}
	if (hasAccessToRead) {
		storyObject.postContent = ampData.html;
	} else {
		storyObject.postContent = formatAmpPaywallStoryPostContent(ampData.html, metadata.paywallLimit);
	}
	storyObject.publishedUrl = story.publishedUrl;
	storyObject.hasAccessToRead = hasAccessToRead;
	storyObject.paywallType = metadata.paywallType;
	storyObject.postContentText = storyObject.postContent;
	metaObject.hasLightbox = ampData.lightbox;
	storyObject.publishedTimestamp = storyObject.publishedAt;
	storyObject.publishedISOTimestamp = new Date(storyObject.publishedAt).toISOString();
	storyObject.updatedTimestamp = storyObject.updatedAt;
	storyObject.publishedAt = moment(storyObject.publishedAt).format('ll');
	storyObject.brand = brandObject;
	storyObject.metadata = metaObject;
	storyObject.protected = story.protected;
	if (metaObject.duration) {
		storyObject.videoDuration = secondsToHhmmss(metaObject.duration);
	}
	if (series) {
		storyObject.series = parser.series.seriesInfo(series);
	}
	if (story.mediaId && story.videoPlatform) {
		storyObject.mediaId = story.mediaId;
		storyObject.videoPlatform = story.videoPlatform;
		storyObject.videoLink = parser.video.getVideoFile(story.videoPlatform, story.mediaId);
	}
	if (!_.isNil(contentReactionsData) && !_.isNil(contentReactionsData.content_id)) {
		const shareCount = computeShareCount(contentReactionsData);
		const contentReactions = parser.contentReactions.contentReactionInfo(contentReactionsData, 'story');
		contentReactions.shareCount = shareCount;
		contentReactions.likeCountReadable = getReadableCount(contentReactions.likeCount);
		storyObject.contentReactions = contentReactions;
	}
	const mastheadAd = storyObject.metadata && (storyObject.metadata.removeAds || storyObject.metadata.sponsoredStory || (storyObject.metadata.brandSpotlight && storyObject.metadata.brandSpotlight.name));
	storyObject.mastheadAd = mastheadAd;
	storyObject.inArticleYTList = ampData.ytVideoList;
	storyObject.inArticleJWList = ampData.jwVideoList;

	if (isCompanyConnectAvailable) {
		storyObject.metadata.connectCompany = {
			id: connectCompany[0].id,
			slug: connectCompany[0].slug,
			name: connectCompany[0].name,
		};
	}
	return storyObject;
};

const getAmpSchemaObject = (storyData, hostLink, slugURL, transcript) => {
	let headline = storyData.title.split(/\r?\n/).join(' ');
	const thumbnail = storyData.metadata.generic && storyData.metadata.generic.media ? storyData.metadata.generic.media : (storyData.metadata.thumbnail ? storyData.metadata.thumbnail : 'https://images.yourstory.com/assets/images/yourstory-logo-1200x720.jpeg');
	headline = headline.slice(0, 110);
	const description = storyData.metadata.generic && storyData.metadata.generic.excerpt ? storyData.metadata.generic.excerpt.split(/\r?\n/).join(' ') : '';
	const article = {
		'@context': 'http://schema.org',
		'@type': 'Article',
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': `${hostLink}${slugURL}/amp`,
		},
		speakable: {
			'@type': 'SpeakableSpecification',
			xpath: [
				'/html/head/title',
				"/html/head/meta[@name='description']/@content",
			],
		},
		isPartOf: 'https://yourstory.com',
		url: `${hostLink}${slugURL}/amp`,
		name: headline,
		headline,
		alternativeHeadline: storyData.slug,
		inLanguage: storyData.brand.locale,
		CopyrightHolder: 'YourStory Media Pvt Ltd',
		image: [
			`${thumbnail}?w=1200`,
		],
		datePublished: new Date(storyData.publishedTimestamp).toISOString(),
		dateModified: new Date(storyData.updatedTimestamp).toISOString(),
		articleSection: 'News',
		articleBody: `${storyData.metadata.plainText ? storyData.metadata.plainText.replace(/[\n\r"]/g, '') : ''}`,
		author: {
			'@type': 'Person',
			name: storyData.metadata.authors[0] ? storyData.metadata.authors[0].name : '',
			description: storyData.metadata.authors[0] ? storyData.metadata.authors[0].description : '',
			sameAs: `${hostLink}/author/${storyData.metadata.authors[0] ? storyData.metadata.authors[0].username : ''}`,
			worksFor: 'YourStory Media Pvt Ltd',
			url: `${hostLink}/author/${storyData.metadata.authors[0] ? storyData.metadata.authors[0].username : ''}`,
			image: {
				'@type': 'ImageObject',
				url: storyData.metadata.authors[0] ? storyData.metadata.authors[0].image_url : '',
				height: 96,
				width: 96,
			},
		},
		description,
		publisher: {
			'@type': 'Organization',
			name: 'YourStory',
			alternateName: 'YourStory Media',
			logo: {
				'@type': 'ImageObject',
				url: 'https://yourstory.com/cs/uploads/YourStorylogo-16-1659946296489.png',
				width: 292,
				height: 60,
				caption: 'YourStory Media',
			},
			url: 'https://yourstory.com',
			sameAs: [
				'https://www.facebook.com/yourstorycom',
				'https://twitter.com/YourStoryCo',
				'https://www.youtube.com/user/yourstorytv',
				'https://instagram.com/yourstory_com',
				'http://plus.google.com/111272339013288238153',
				'https://in.linkedin.com/company/yourstory-com',
			],
		},
		editor: {
			'@type': 'Person',
			name: storyData.metadata.editors[0] ? storyData.metadata.editors[0].name : storyData.metadata.authors[0].name,
			description: storyData.metadata.editors[0] ? storyData.metadata.editors[0].description : storyData.metadata.authors[0].description,
			url: `${hostLink}/author/${storyData.metadata.editors[0] ? storyData.metadata.editors[0].username : storyData.metadata.authors[0].username}`,
			image: {
				'@type': 'ImageObject',
				url: storyData.metadata.editors[0] ? storyData.metadata.editors[0].image_url : storyData.metadata.authors[0].image_url,
				height: 96,
				width: 96,
			},
		},
	};
	if (storyData.metadata && storyData.metadata.audioFile) {
		article.audio = {
			'@type': 'AudioObject',
			caption: headline,
			transcript: `${storyData.metadata.plainText ? storyData.metadata.plainText.replace(/[\n\r"]/g, '') : ''}`,
			contentUrl: storyData.metadata.audioFile,
			encodingFormat: 'audio/mpeg',
		};
	}
	const storyStructure = {};
	if ((storyData.mediaId && storyData.videoPlatform) || (storyData.metadata.thumbnailMediaId && storyData.metadata.thumbnailPlatform)) {
		Object.assign(storyStructure, {
			'@context': 'https://schema.org',
			'@type': 'VideoObject',
			name: storyData.metadata.generic.title,
			description,
			thumbnailUrl: `${thumbnail}?w=1200`,
			uploadDate: storyData.publishedAt,
			duration: storyData.metadata.duration_iso,
			publisher: {
				'@type': 'Organization',
				name: 'YourStory',
				logo: {
					'@type': 'ImageObject',
					url: 'https://images.yourstory.com/cs/static/logos/publisher-logo.png',
					width: 292,
					height: 60,
				},
			},
			embedUrl: `${hostLink}/api/v2/story/video-player?path=${slugURL}`,
		});
		if (transcript) {
			storyStructure.transcript = transcript;
		}
		if (storyData.videoPlatform === 'jwplayer') {
			storyStructure.contentUrl = storyData.videoLink;
		}
	} else {
		Object.assign(storyStructure, article);
		storyStructure['@type'] = 'NewsArticle';
		storyStructure.dateline = 'Bangalore, India';
	}
	if (storyData.protected) {
		const paywallData = {
			isAccessibleForFree: 'False',
			hasPart:
			{
				'@type': 'WebPageElement',
				isAccessibleForFree: 'False',
				cssSelector: '.paywall_access',
			},
		};
		Object.assign(article, paywallData);
	}
	let secondPosSlug;
	let secondPosName;
	let secondPosType;
	if (storyData.metadata.category) {
		secondPosSlug = storyData.metadata.category.slug;
		secondPosName = storyData.metadata.category.name;
		secondPosType = '/category/';
	} else if (storyData.metadata.tag && storyData.metadata.tag.length && storyData.metadata.tag[0]) {
		secondPosSlug = storyData.metadata.tag[0].slug;
		secondPosName = storyData.metadata.tag[0].name;
		secondPosType = '/tag/';
	} else {
		const date = new Date(storyData.publishedAt);
		secondPosSlug = `${date.getUTCFullYear()}/${date.getMonth()}`;
		secondPosName = secondPosSlug;
		secondPosType = '/';
	}
	const breadCrumbList = {
		'@context': 'http://schema.org/',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				item: {
					'@id': hostLink,
					'@type': 'WebSite',
					name: 'YourStory',
					url: hostLink,
				},
			}, {
				'@type': 'ListItem',
				position: 2,
				item: {
					'@id': `${hostLink}${secondPosType}${secondPosSlug}`,
					'@type': 'WebPage',
					name: `${secondPosName}`,
					url: `${hostLink}${secondPosType}${secondPosSlug}`,
				},
			}, {
				'@type': 'ListItem',
				position: 3,
				item: {
					'@id': `${hostLink}${slugURL}/amp`,
					'@type': 'WebPage',
					name: storyData.title,
					url: `${hostLink}${slugURL}/amp`,
					image: {
						'@type': 'ImageObject',
						url: `${thumbnail}?w=1200`,
						height: 400,
						width: 800,
					},
				},
			},
		],
	};
	return { article: JSON.stringify(article), storyStructure: JSON.stringify(storyStructure), breadCrumbList: JSON.stringify(breadCrumbList) };
};

const getAmpContent = async (storyId, content, adTarget, showAds = true, storyAssets = [], guestAuthor = false, editors, inArticleAdConfig, companyConnect = null, storyUrl, brand) => {
	try {
		let postContent = content;
		if (content.indexOf('<div class="quill-content">') < 0) {
			postContent = `<div>${content}</div>`;
		}
		let storyAssetsData = {};
		if (storyAssets && storyAssets.length > 0) {
			storyAssetsData = arrayToObject(storyAssets, 'slug');
		}
		const companyConnectWidget = (sectionName) => {
			if (companyConnect && companyConnect.id) {
				return `<div class='company-connect-link' on="tap:login-popup.show,login-popup.toggleClass(class='desktop-only', force=false),connect-lightbox.show" data-vars-section-name="${sectionName}" data-vars-company-name="${companyConnect.name}" role="button" tabindex="0">
						<div class="company-connect">Get connected to ${companyConnect.name} <amp-img src='https://yourstory.com/icons/ys_connect_icon.svg' alt="ys-connect" width="25" height="25" layout="fixed">
						</div>
					</div>`;
			}
			return null;
		};
		const $ = cheerio.load(postContent);
		$('figure').each(function () {
			const html = $(this).html();
			const style = $(this).attr('style');
			let alignClass;
			if (style?.match(/width: ?50%/)) {
				alignClass = `${style.match(/float: right/) ? 'right' : 'left'}-aligned-img`;
			}
			$(this).replaceWith(`<div ${alignClass ? `class =${alignClass}` : ''}>${html}</div>`);
		});
		// remove all inline attributes
		$('[style]').removeAttr('style');
		$('[class]').removeAttr('style');
		$('style').remove();
		$('script').remove();
		// $("twitter-widget").remove();
		$('st1\\:city').each(function () {
			$(this).replaceWith($(this).html());
		});
		$('st1\\:place').each(function () {
			$(this).replaceWith($(this).html());
		});
		$('st1\\:country-region').each(function () {
			$(this).replaceWith($(this).html());
		});
		$('embed').each(function () {
			const src = `https://docs.google.com/gview?url=${$(this).attr('src')}&embedded=true`;
			const html = `<amp-iframe sandbox="allow-scripts allow-same-origin" src='${src}' width=500 layout="responsive" height=281 allowfullscreen frameborder='0'></amp-iframe>`;
			$(this).replaceWith(`<div>${html}</div>`);
		});
		$('div.tweet.disablePointerEvents').each(function () {
			$(this).replaceWith($(this).html());
		});
		$('blockquote.twitter-tweet').each(function () {
			const twitterLinks = $(this).find('a[href*=twitter]');
			const tweetLink = twitterLinks[twitterLinks.length - 1].attribs.href;
			const tweetId = tweetLink.split('?')[0].split('/')[5];
			const tweetHtml = `<amp-twitter class="element-mt element-mb" width="375" height="472" layout="responsive" data-tweetid="${tweetId}"></amp-twitter>`;
			$(this).replaceWith(`<div>${tweetHtml}</div>`);
		});
		$('div.insta.disablePointerEvents').each(function () {
			$(this).replaceWith($(this).html());
		});
		$('blockquote.instagram-media-registered').each(function () {
			$(this).remove();
		});
		$('blockquote').each(function () {
			$(this).attr('class', 'font-experiment-bq');
		});
		if (companyConnect && companyConnect.id) {
			$('quill-content').append(companyConnectWidget('section-article-end'));
		}
		$('html').each((item, i) => {
			i.tagName = 'div';
		});
		$('body').each((item, i) => {
			i.tagName = 'div';
		});
		$('head').each((item, i) => {
			i.tagName = 'div';
		});
		$('a').each(function () {
			try {
				let href = decodeURI($(this).attr('href'));

				if (href.startsWith('http://backend.yourstory.com')) {
					href = href.replace('http://backend.yourstory.com', '');
					$(this).attr('href', href);
				} else if (href.startsWith('https://backend.yourstory.com')) {
					href = href.replace('https://backend.yourstory.com', '');
					$(this).attr('href', href);
				}

				if (href.startsWith('/')) {
					const re = /([/]20[0-9][0-9][/])/;
					if (re.test(href)) {
						href = `${href}${href.endsWith('/') ? '' : '/'}amp/`;
					}
					href = `https://yourstory.com${href}`;
					$(this).attr('href', href);
				}
				if (!validUrl.isUri(href)) {
					if (!validUrl.isUri($(this).attr('href'))) $(this).attr('href', '#');
				}
			} catch (err) {
				$(this).attr('href', '#');
			}
		});
		$('.quote-share').each(function () {
			const quote = $(this).data('quote');
			const source = $(this).data('source');
			const text = `"${quote}," ${source}.`;
			const url = encodeURIComponent(storyUrl);
			$(this).children().each(function () {
				if ($(this).hasClass('circle')) {
					const html = `<a href='https://twitter.com/share?url=${url}&text=${text}' class="circle"><amp-img src="https://images.yourstory.com/assets/icons/ic_white_twitter.svg" alt="twitter-icon" layout="fixed" width="32" height="32" /></a>`;
					$(this).replaceWith(html);
				}
			});
		});
		let imgCounter = 0;
		$('img').each(function () {
			let src = $(this).attr('src');
			if (src) {
				src = src.split('?fm=png&auto=format')[0];
				let html = '';
				let title = '';
				let height = null;
				let width = null;
				if (storyAssetsData && !_.isNil(storyAssetsData[src])) {
					title = !_.isNil(storyAssetsData[src].title) ? storyAssetsData[src].title : '';
					title = title.replace(/"/g, '&#34;').replace(/'/g, '&#39;');
					height = storyAssetsData[src].height;
					width = storyAssetsData[src].width;
				} else {
					width = Number($(this).attr('width'));
					height = Number($(this).attr('height'));
				}
				if (!_.isNil(height) && !_.isNil(width) && !_.isNaN(height) && !_.isNaN(width)) {
					const w = width < 800 ? width : 800;
					html = `<amp-img class="element-mt element-mb" alt="${title}" src="${src}?fm=auto&mode=crop&crop=faces&ar=${width}:${height}&w=${w}" media="(max-width: 480px)" height="${height}" width="${width}" layout="intrinsic"></amp-img>
					<amp-img class="element-mt element-mb" alt="${title}" src="${src}?fm=auto&mode=crop&crop=faces&ar=${width}:${height}&w=${w}" media="(min-width: 481px)" height="${height}" width="${width}" layout="intrinsic"></amp-img>`;
				} else {
					imgCounter++;
					html = `<div class="amp-img-fixed-container"><amp-image-lightbox id="lightbox${imgCounter}" layout="nodisplay"></amp-image-lightbox><amp-img on="tap:lightbox${imgCounter}" id="lightbox${imgCounter}" src="${src}?fm=auto&mode=crop&crop=faces&w=600" tabindex="0" role="button" class="aligncenter contain" layout="fill" alt="${title}"></amp-img></div>`;
				}
				$(this).replaceWith(`<div>${html}</div>`);
			} else {
				$(this).replaceWith('\n');
			}
		});
		try {
			if (companyConnect && companyConnect.id) {
				let companyConnectWidgetWordCount = 0;
				let widgetCount = 0;
				$('.quill-content').children().each(function () {
					const splitBlock = $(this).text().split(' ');
					if (splitBlock && splitBlock.length && !(splitBlock.length === 1 && splitBlock[0] === '')) {
						companyConnectWidgetWordCount += splitBlock.length;
						if (companyConnectWidgetWordCount >= 100) {
							$(this).after(companyConnectWidget(`section-${widgetCount + 1}`)).html();
							companyConnectWidgetWordCount = 0;
							widgetCount++;
							if (widgetCount === 2) {
								return false;
							}
						}
					}
				});
			}
		} catch (err) {
			console.log('Error inserting company connect widget.');
		}
		$('div.alsoread').each(function () {
			const alsoReadTitle = $(this).attr('data-title');
			const alsoReadThumbnail = $(this).attr('data-thumbnail');
			let alsoReadPublishedUrl = $(this).attr('data-published-url');
			if (alsoReadPublishedUrl.includes(process.env.SERVICE_PWA)) {
				alsoReadPublishedUrl += '/amp';
			}
			const alsoReadHTML = `
				<div class="alsoread element-mt element-mb">
					<div class="alsoread-div">
						<div class="subtext">ALSO READ</div>
						<a href="${alsoReadPublishedUrl}" class="also-read" data-vars-article-url="${alsoReadPublishedUrl}">
							<div>
								<div>
									<amp-img class="ampstart-byline-photo mr3 left" src="${alsoReadThumbnail}" layout="fixed" height="81" width="81"></amp-img>
								</div>
								<div>
									<div class="title">${alsoReadTitle}</div>
								</div>
							</div>
						</a>
					</div>
				</div>
			`;
			$(this).replaceWith(alsoReadHTML);
		});
		$('figcaption').each(function () {
			$(this).removeAttr('align');
		});
		$('p').each(function () {
			if ($(this).html().startsWith('http://twitter.com') || $(this).html().startsWith('https://twitter.com')) {
				const twitter_id = $(this).html().split('/')[5];
				const html = `<amp-twitter width="375" height="472" layout="responsive" data-tweetid="${twitter_id}"></amp-twitter>`;
				$(this).replaceWith(`<div>${html}</div>`);
			} else if ($(this).html() === '<br>') {
				$(this).replaceWith('');
			}
		});
		const ytVideoList = [];
		const jwVideoList = [];
		$('iframe').each(function () {
			let src = $(this).attr('src');
			if (src && src !== 'about:blank') {
				if (!validUrl.isHttpsUri(src)) {
					src = src.replace('http://', 'https://');
				}
				let html = `<amp-iframe class="element-mt element-mb" src="${src}" width="500" height="281" layout="responsive" sandbox="allow-scripts allow-same-origin allow-popups" allowfullscreen frameborder="0"> </amp-iframe>`;
				try {
					if (/slideshare.net/.test(src)) {
						let slideUrl = src;
						if (src.startsWith('//www')) {
							slideUrl = src.replace('//www', 'https://www');
						}
						html = `<amp-iframe class="element-mt element-mb" src="${slideUrl}" width="500" height="281" layout="responsive" sandbox="allow-scripts allow-same-origin allow-popups" allowfullscreen frameborder="0"> </amp-iframe>`;
					} else if (/instagram.com/.test(src)) {
						const instaId = src.split('?')[0].split('/')[4];
						html = `<amp-instagram class="element-mt element-mb" data-shortcode="${instaId}" data-captioned width="400" height="400" layout="responsive"></amp-instagram>`;
					} else if (/twitter.com/.test(src)) {
						const twitter_id = src.split('/')[5];
						html = `<amp-twitter class="element-mt element-mb" width="375" height="472" layout="responsive" data-tweetid="${twitter_id}"></amp-twitter>`;
					} else if (/facebook.com/.test(src)) {
						const fbUrl = src.split('href=')[1].split('&')[0];
						html = `<amp-facebook class="element-mt element-mb" width="552" height="310" layout="responsive" data-href=${decodeURIComponent(fbUrl)}></amp-facebook>`;
					} else if (/youtube.com|you.tube/.test(src)) {
						let videoId = src.split('embed/')[1].split('?')[0];
						videoId = videoId.includes('&') ? videoId.split('&')[0] : videoId;
						ytVideoList.push(videoId);
						html = `<amp-youtube
							class="element-mt element-mb yt-${videoId}"
							width="480"
							height="270"
							layout="responsive"
							data-param-loop="1"
							data-param-modestbranding="1"
							data-videoid=${videoId}
							data-vars-media-id="${videoId}"
							data-vars-video-title="inarticle-video" />`;
					} else if (/soundcloud.com/.test(src)) {
						const trackId = src.split('tracks/')[1].split('&')[0];
						html = `<amp-soundcloud class="element-mt element-mb" height="166" layout="fixed-height" data-trackid=${trackId}></amp-soundcloud>`;
					} else if (/jwplayer.com/.test(src)) {
						const playerData = src.split('players/')[1].split('.html')[0].split('-');
						const [videoId, playerId] = playerData;
						jwVideoList.push(videoId);
						html = `<amp-jwplayer
							class="element-mt element-mb jw-${videoId}"
							data-vars-media-id="${videoId}"
							data-vars-video-title="inarticle-video"
							width="480"
							height="270"
							layout="responsive"
							data-media-id="${videoId}"
							data-player-id="${playerId || 'jRjQPNQB'}" />`;
					}
				} catch (e) {
					logger.error(`Error parsing amp iframe content (src = ${src})`, e);
				}
				$(this).replaceWith(`<div>${html}</div>`);
			} else {
				$(this).replaceWith('');
			}
		});
		$('.caption-wrapper').each(function () {
			if ($(this).text() === 'image') {
				$(this).text('');
			}
		});
		$('[contenteditable]').removeAttr('contenteditable');
		$('undefined').each((i, item) => {
			item.name = 'span';
		});
		/* temporary rectification until changed from editor  start */
		$('a').each(function () {
			let href = $(this).attr('href');
			$(this).removeAttr('"');
			if (!href || ['about:blank', ''].includes(href)) {
				$(this).removeAttr('href');
			} else {
				href = href.replace(/"/g, '&#34;').replace(/'/g, '&#39;').replace(/htttp/g, 'http');
				$(this).attr('href', href);
			}
		});
		$('div.embed').each(function () {
			const src = $(this).attr('src');
			if (src) {
				$(this).removeAttr('src');
			}
		});
		/* end */
		if (companyConnect && companyConnect.id) {
			$('.quill-content').append(companyConnectWidget);
		}
		if (editors && editors.length) {
			let editorNames = '';
			if (editors.length > 1) {
				editors.forEach((editor, index) => {
					if (index === editors.length - 1) {
						editorNames = editorNames.concat(`and ${editor.name}`);
					} else editorNames = editorNames.concat(`${editor.name}${editors.length - 2 === index ? ' ' : ', '}`);
				});
			} else {
				editorNames = editors[0].name;
			}
			const editedBy = `<div class="edited-by mb3"><div class="dotted pt2 pb2"></div>Edited by ${editorNames}</div>`;
			$('.quill-content').append(editedBy);
		}
		if (guestAuthor) {
			const disclaimer = '<p><em>(Disclaimer: The views and opinions expressed in this article are those of the author and do not necessarily reflect the views of YourStory.)</em></p>';
			$('.quill-content').append(disclaimer);
		}

		const promises = [];
		let visitedComapanyWidgetID = {};
		$('.company-widget').each(function () {
			const companyId = $(this).data('id');
			const companyName = $(this).data('name');
			$(this).attr('role', 'button');
			$(this).attr('tabindex', '0');
			$(this).attr('on', `tap:company-popup-${companyId}`);
			$(this).attr('data-vars-company-name', companyName);
			if (!visitedComapanyWidgetID[companyId]) {
				const companyWidget = getCompanyWidget(companyId);
				promises.push(companyWidget);
			}
			visitedComapanyWidgetID = { ...visitedComapanyWidgetID, [companyId]: true };
		});

		await Promise.all(promises).then((promiseArray) => (promiseArray).forEach((value) => {
			if (value) {
				visitedComapanyWidgetID[value.companyId] = false;
				$('.quill-content').append(value.data);
			}
		}));

		/**
		 * Here visitedComapanyWidgetID[companyId] === true
		 * indicates that it did't had a response in above promises
		 * and thus was not VERIFIED or fetched company
		 */
		$('.company-widget').each(function () {
			if (visitedComapanyWidgetID[$(this).data('id')]) {
				$(this).removeAttr('class');
				$(this).removeAttr('on');
				$(this).removeAttr('role');
				$(this).removeAttr('tabindex');
			}
		});

		let html = $.html();
		if (showAds) {
			const _contentIterator = splitContent(inArticleAdConfig.first_ad_insert_word_limit, inArticleAdConfig.ad_insert_word_limit, html);
			const adScripts = getAmpAds(adTarget);
			if (_contentIterator?.length) {
				$('.quill-content').empty();
				let flag = 0;
				_contentIterator.forEach((element) => {
					$('.quill-content').append(element);
					if (flag < 6 && flag < _contentIterator.length - 1) {
						$('.quill-content').append(adScripts[flag]);
						flag++;
					}
				});
				html = $.html();
			} else {
				$('.quill-content').append(adScripts[0]);
				html = $.html();
			}
		}
		let wordCount = 0;
		let iterator = 1;

		$('.quill-content').children().each(function () {
			const splitBlock = $(this).text().split(' ');
			if (splitBlock && splitBlock.length && !(splitBlock.length === 1 && splitBlock[0] === '')) {
				wordCount += splitBlock.length;
				if (iterator === 1 && wordCount >= 400) {
					const brandData = brandsData[brand.slug] || brandsData.yourstory;
					$(this).after(`
						<div id="newsletter-widget">
							<fieldset class="newsletter-fieldset mb1">
								<legend class="px2 center">
									<div class="flex items-center">
										<svg width="30" height="26" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg" class="mr1">
											<path d="M4.19527 6.57194L21.7574 1.86617C22.9648 1.54265 24.2174 2.26582 24.5409 3.47322L28.0702 16.6448C28.3938 17.8522 27.6706 19.1048 26.4632 19.4283L8.90104 24.1341C7.69364 24.4576 6.44107 23.7344 6.11755 22.527L2.58822 9.35543C2.2647 8.14803 2.98787 6.89546 4.19527 6.57194Z" stroke="${brandData.themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
											<path d="M24.5408 3.47314L15.6233 14.0977L2.58813 9.35535" stroke="${brandData.themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
										<h2 class="ml1 newsletter-heading">Stay Updated</h2>
									</div>
								</legend>
								<div id="newsletter-form" class="center">
									<p class="newsletter-label">${brandData.newsletterText}</p>
									<form id="newsletter-form" enctype="application/x-www-form-urlencoded" custom-validation-reporting="show-all-on-submit" method="POST" action-xhr="/api/v2/newsletters/subscription?source=amp" target="_blank" on="submit-success:newsletter-form.hide,newsletter-success.show">
										<div>
											<div class="form-data">
												<input
													id="email"
													name="email"
													type="email"
													placeholder="Enter email Id"
													required
												/>
												<input
													name="brand"
													type="hidden"
													value="${brand.slug}"
												/>
												<button type="submit">
													<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
														<path d="M1 8H15" stroke="${brandData.themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
														<path d="M8 1L15 8L8 15" stroke="${brandData.themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
													</svg>
												</button>
												<amp-recaptcha-input
													layout="nodisplay"
													name="g_recaptcha_response"
													data-sitekey="6LdPc6IcAAAAAFKJKqHFp97Ey83pl_Ix6bkIySzt"
													data-action="newsletter_subscription"
												></amp-recaptcha-input>
											</div>
											<p class="newsletter-error" visible-when-invalid="valueMissing" validation-for="email">Please fill in this field.</p>
											<p class="newsletter-error" visible-when-invalid="typeMismatch" validation-for="email"></p>
											<div class="error-div" submit-error>
												<template type="amp-mustache">
													{{#error}}
														<p class="newsletter-error">{{error}}</p>
													{{/error}}
													{{^error}}
														<p class="newsletter-error">Something went wrong. Try again later</p>
													{{/error}}
												</template>
											</div>
										</div>
									</form>
								</div>
								<div id="newsletter-success" class="center" hidden>
									<p class="mt0 mb1 newsletter-success-font">Welcome Onboard !</p>
									<p class="mt1 newsletter-success-font">You have been successfully registered for our daily newsletter.</p>
								</div>
							</fieldset>
							<div class="black-border"></div>
						</div>
					`).html();
					iterator += 1;
					wordCount = 0;
				}
			}
		});
		html = $.html();

		return {
			html,
			lightbox: imgCounter > 0,
			ytVideoList,
			jwVideoList,
		};
	} catch (e) {
		logger.error(`AMP content transform error (storyId = ${storyId})`, e);
		return {
			html: null,
			lightbox: false,
		};
	}
};

function splitContent(first_ad_insert_word_limit, ad_insert_word_limit, content) {
	try {
		let separator = first_ad_insert_word_limit;
		const $ = cheerio.load(content);
		const content_parts = [];
		let current_content_part = '';
		let current_count = 0;
		$('.quill-content').children().each(function () {
			const html = $('<div />').append($(this).clone()).html();
			const text = $('<div />').append($(this).clone()).text();
			const wordCount = text.split(' ').length;
			current_count += wordCount;
			current_content_part += html;
			if (current_count >= separator) {
				content_parts.push(current_content_part);
				current_content_part = '';
				current_count = 0;
				if (separator !== ad_insert_word_limit) {
					separator = ad_insert_word_limit;
				}
			}
		});
		content_parts.push(current_content_part);
		return content_parts;
	} catch (e) {
		logger.error('Error in splitcontent', e);
		return [];
	}
}

function getAmpAds(targeting) {
	targeting.brand = !_.isNil(targeting.brand) ? targeting.brand.replace(/"/g, '&#34;').replace(/'/g, '&#39;') : targeting.brand; // escape all quotes in the string
	targeting.path = !_.isNil(targeting.path) ? targeting.path.replace(/"/g, '&#34;').replace(/'/g, '&#39;') : targeting.path; // escape all quotes in the string
	targeting.adCategory = !_.isNil(targeting.adCategory) ? targeting.adCategory.replace(/"/g, '&#34;').replace(/'/g, '&#39;') : targeting.adCategory; // escape all quotes in the string
	targeting.adTags = targeting.adTags && targeting.adTags.length > 0 ? targeting.adTags.map((tag) => {
		if (!_.isNil(tag)) {
			return tag.replace(/"/g, '&#34;').replace(/'/g, '&#39;');
		}
		return tag;
	}) : targeting.adTags; // escape all quotes in the string
	const adScripts = [];
	for (let adIterator = 1; adIterator < 7; adIterator++) {
		const adString = `<amp-ad class="in-article-ad" width="300" height="250" type="doubleclick" json='{"targeting":{"Brand": "${targeting?.brand}", "path": "${targeting?.path}", "category": "${targeting?.adCategory}", "tags": "${targeting?.adTags}"}}' layout="responsive" data-slot="/154555149/ys_en_nm_amp_art_re_${adIterator}"></amp-ad>`;
		adScripts.push(adString);
	}
	return adScripts;
}

const getCompanyWidget = async (companyId) => {
	const companyDetails = await companyById(companyId);
	if (companyDetails && companyDetails.id && ['VERIFIED'].includes(companyDetails.status)) {
		const companyCoreTeam = await companyPeopleByCompanyId(companyId);
		const {
			name, slug, logo, subtitle, foundingDate,
		} = companyDetails;
		const companyURL = `${SERVICE_PWA}/companies/${slug}/amp`;
		const sectors = await companySectors({ whereObj: { slug } });
		const companyWidget = `
						<amp-lightbox id="company-popup-${companyId}"
						layout="nodisplay">
						<div class="i-icon-lightbox"
							on="tap:company-popup-${companyId}.close"
							role="button"
							tabindex="0">
							<div class="company-popup-container" on="tap:false" role="button" tabindex="0" >
							<div class="company-popup-share-icon">
							<div class="">
							<span class="share">
							<amp-social-share type="system" class="native-share black"
									width="20" height="20"
									data-param-text="${name} | YourStory" data-param-url=${companyURL}>
							</amp-social-share>
							<div class="web-snippet-share-container ">
									<amp-img
										role="button"
										class="lg-only web-snippet-share"
										tabindex="-1"
										src="https://images.yourstory.com/assets/icons/ic_share_black.svg"
										width="20"
										height="20"
										layout="fixed"
										alt="AMP"
									>
									</amp-img>
									<div class="snippet-share-icons">
										<amp-social-share
											class="black"
											aria-label="Share on Facebook"
											type="facebook"
											data-param-app_id="252967394737645" 
											data-param-quote="${name} | YourStory"
											data-param-href=${companyURL} 
											width="24"
											height="24"
										>
										</amp-social-share>
										<amp-social-share
											class="black"
											aria-label="Share on Twitter"
											data-param-via="YourStoryCo"
											data-param-text="${name} | YourStory" 
											data-param-url=${companyURL} 
											width="24"
											height="24"
											type="twitter"
										>
										</amp-social-share>
										<amp-social-share
											class="black"
											aria-label="Share on LinkedIn"
											data-param-url=${companyURL} 
											type="linkedin"
											width="24"
											height="24"
										>
										</amp-social-share>
										<amp-social-share
											class="black"
											aria-label="Share on WhatsApp"
											data-param-text="${name} | YourStory" 
											type="whatsapp"
											width="24"
											height="24"
										>
										</amp-social-share>
									</div>
								</div>                              
							</span>
							</div>
							</div>
								<div class="company-popup-upper-container">
								</div>
								${(companyCoreTeam.length || sectors.length)
		? `
								<div class="partition opacity-1"></div>
								<div class="company-popup-mid-container">
								${companyCoreTeam.length ? '<div class="company-popup-core-team"></div>' : ''}
								${sectors.length ? '<div class="company-popup-industries"></div>' : ''}
								</div>`
		: ''}
								<div class="partition opacity-1"></div>
								<div class="company-popup-lower-container">
								</div>
							</div>
						</div>
					</amp-lightbox>`;
		// Cheerio to parse comapnyWidget
		const content = cheerio.load(companyWidget);

		if (companyDetails.logo) {
			content('.company-popup-upper-container')
				.append(`
					<div class="company-popup-logo">
						<amp-img src="${logo.url}"
							width="90"
							height="90"
							layout="fixed"
							alt="submit_icon_mute">
						</amp-img>
					</div>
				`);
		}
		if (companyDetails.name) {
			content('.company-popup-upper-container')
				.append(`<div class="company-popup-name">${name}</div>`);
		}
		if (companyDetails.subtitle) {
			content('.company-popup-upper-container')
				.append(`<div class="company-popup-desc truncate-3">${subtitle}</div>`);
		}
		if (companyDetails.foundingDate) {
			content('.company-popup-lower-container').append(`
				<div class="company-popup-founded-date">Founded: ${foundingDate ? foundingDate.substring(0, 4) : ''}</div>
				<div class="partition-vertical opacity-1"></div>
				<a target="_blank" class="popup-company-link" href=${companyURL} data-vars-company-name="${name}">View Profile <amp-img class="connectImg ml2" src="https://yourstory.com/icons/ys_connect_icon_theme.svg" width="18" height="18"></amp-img> </a>
			`);
		} else {
			content('.company-popup-lower-container').append(`
			<a target="_blank" class="popup-company-link" href=${companyURL} data-vars-company-name="${name}">View Profile <amp-img class="connectImg ml2" src="https://yourstory.com/icons/ys_connect_icon_theme.svg" width="18" height="18"></amp-img> </a>
			`);
		}
		// Adding Comapny Core team names
		if (companyCoreTeam.length) {
			content('.company-popup-core-team').append(`
			<h6 class="company-popup-core-team-header">Core Team</h6>`);
			companyCoreTeam.map((people, id) => content('.company-popup-core-team').append(`<h6 class="company-popup-values">${id + 1}. ${people.influencerProfile.name}</h6>`));
		}
		// Adding Industries
		if (sectors.length) {
			content('.company-popup-industries').append(`
			<div class="company-popup-header-container">
			<amp-img src="https://images.yourstory.com/assets/icons/ic_tags.svg"
				width="16"
				height="16"
				class="industries-icon"
				layout="fixed"
				alt="AMP_INDUSTRIES_ICON">
			</amp-img>
			<h6 class="company-popup-industries-header">Industries</h6>
			</div>
			<div class="industries-only-list"></div>
			<div class="industries-list"></div>
			`);
			if (!companyCoreTeam.length) {
				sectors.map((value, index) => (index === sectors.length - 1
					? content('.industries-only-list').append(`<h6 class="company-popup-values mlr2">${value.name}</h6>`)
					: content('.industries-only-list').append(`<h6 class="company-popup-values mlr2">${value.name},</h6>`)
				));
			} else {
				sectors.map((value) => content('.industries-list').append(`<h6 class="company-popup-values">${value.name}</h6>`));
			}
		}
		return { companyId, companyName: name, data: content('body').html() };
	}
};

const formatAmpPaywallStoryPostContent = (postContent, paywallLimit) => {
	const paraLimit = Number(paywallLimit);
	let paraCount = 0;
	const content = cheerio.load('');
	let parsedPostContent = postContent;
	try {
		parsedPostContent = JSON.parse(postContent);
	} catch (err) {
		parsedPostContent = postContent;
	}
	const $ = cheerio.load(parsedPostContent);

	content('body').append('<div class=quill-content></div>');
	content('.quill-content').append('<section class=free_access></section>');
	content('.quill-content').append('<section amp-access=hasAccessToRead amp-access-hide  class=paywall_access></section>');

	$('.quill-content').children().each(function () {
		if (paraCount < paraLimit) content('.free_access').append($(this).clone());
		else content('.paywall_access').append($(this).clone());
		if ($(this)[0].name === 'p' && $(this).html().trim() !== '<br>' && $(this).html().trim() !== 'space') paraCount += 1;
	});

	return content('body').html();
};

const getCompanyAmpSchemaObject = ({ companyData, hostLink }) => {
	const baseUrl = hostLink;
	const pageUrl = `${baseUrl}/companies/${companyData.slug}`;
	const { introduction, basicInformation, locations } = companyData.sections;
	const logo = introduction && introduction.data && introduction.data.logo;
	const coreTeam = introduction && introduction.data && introduction.data.coreTeam && introduction.data.coreTeam;
	const description = basicInformation && basicInformation.data && basicInformation.data.description && basicInformation.data.description;
	const companyPages = introduction && introduction.data && introduction.data.socialLinks
		&& Object.keys(introduction.data.socialLinks) && Object.keys(introduction.data.socialLinks).length > 0
		? Object.keys(introduction.data.socialLinks).map((i) => introduction.data.socialLinks[i] || undefined).filter((i) => i) : undefined;
	if (companyPages && companyPages.length && introduction && introduction.data && introduction.data.website) {
		companyPages.push(introduction.data.website);
	}
	const founders = coreTeam && coreTeam.length > 0 ? coreTeam.map((person) => ({
		'@type': 'Person',
		name: person.name,
		image: {
			'@type': 'ImageObject',
			url: person.image && person.image.url ? person.image.url : 'https://images.yourstory.com/cs/static/icons/placeholder_user.png',
			height: person.image && person.image.height ? person.image.height : undefined,
			width: person.image && person.image.width ? person.image.width : undefined,
		},
		jobTitle: person.designation ? person.designation : undefined,
		worksFor: companyData.name,
	})) : undefined;
	const location = locations && locations.data && locations.data.length > 0 && locations.data.map((item) => {
		if (item.headquarters) {
			const address = `${item.addressLine1 ? item.addressLine1 : ''}${item.addressLine1 ? `, ${item.addressLine2}` : ''}`;
			return {
				'@type': 'Place',
				address: {
					'@type': 'PostalAddress',
					addressLocality: address || undefined,
					addressRegion: item.city ? item.city : undefined,
				},
				hasMap: item.googleMapLink ? item.googleMapLink : undefined,
			};
		}
		return null;
	}).filter((i) => i);
	const organizationSchema = {
		'@context': 'http://schema.org',
		'@type': 'Organization',
		'@id': `${pageUrl}/amp`,
		legalName: basicInformation && basicInformation.data && basicInformation.data.legalName ? basicInformation.data.legalName : companyData.name,
		url: `${pageUrl}/amp`,
		address: basicInformation && basicInformation.data && basicInformation.data.headquarters ? basicInformation.data.headquarters : undefined,
		description: description || undefined,
		founder: founders || undefined,
		foundingDate: basicInformation && basicInformation.data && basicInformation.data.foundingDate ? basicInformation.data.foundingDate : undefined,
		logo: {
			'@type': 'ImageObject',
			url: logo && logo.url ? logo.url : 'https://yourstory.com/icons/assets/company.svg',
			height: logo && logo.height ? logo.height : undefined,
			width: logo && logo.width ? logo.width : undefined,
		},
		numberOfEmployees: basicInformation && basicInformation.data && basicInformation.data.employeeSize ? basicInformation.data.employeeSize.name : undefined,
		sameAs: companyPages,
		location: location && location.length > 0 ? location[0] : undefined,
	};
	const pitchVideo = basicInformation && basicInformation.data && basicInformation.data.showcaseVideo;
	const analyticsTrigger = getAmpCompanyAnalyticsTriggers(pitchVideo);
	Object.assign(analyticsTrigger, getAmpBroadcastAnalyticsTriggers());

	return { organizationSchema: JSON.stringify(organizationSchema), analyticsTrigger: JSON.stringify(analyticsTrigger) };
};

const getAmpCompanyAnalyticsTriggers = (pitchVideo) => {
	const triggers = {
		trackPageview: {
			on: 'visible',
			request: 'pageview',
		},
		scrollPings: {
			on: 'scroll',
			scrollSpec: {
				verticalBoundaries: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			},
			vars: {
				/* eslint-disable no-template-curly-in-string */
				pageScroll: '${verticalScrollBoundary}',
			},
			request: 'pageScrollPercent',
		},
		pageTime: {
			on: 'visible',
			visibilitySpec: {
				reportWhen: 'documentExit',
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		pageNewTime: {
			on: 'hidden',
			visibilitySpec: {
				repeat: true,
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		trackclaimButtonClick: {
			on: 'click',
			selector: '.claim',
			vars: {
				eventName: 'PROFILES_CLAIM_BUTTON_CLICK_AMP',
			},
			request: 'trackButtonClick',
		},
		trackConnectButtonClick: {
			on: 'click',
			selector: '.connect',
			vars: {
				eventName: 'PROFILES_CONNECT_BUTTON_CLICK_AMP',
				companyName: '${companyName}',
			},
			request: 'trackConnectButtonClick',
		},
		trackConnectSubmitClick: {
			on: 'click',
			selector: '#submit-connect-form',
			vars: {
				eventName: 'PROFILES_CONNECT_SUBMIT_CLICK_AMP',
				sectionName: '${sectionName}',
				companyName: '${companyName}',
			},
			request: 'trackConnectButtonClick',
		},
		trackClaimSubmitClick: {
			on: 'click',
			selector: '#claim-profile-submit',
			vars: {
				eventName: 'PROFILES_CLAIM_SUBMIT_CLICK_AMP',
				sectionName: '${sectionName}',
			},
			request: 'trackButtonClick',
		},
		trackConnectReasonClick: {
			on: 'click',
			selector: '.connect-reason',
			vars: {
				eventName: 'PROFILES_CONNECT_REASON_CLICK_AMP',
				connectReason: '${connectReason}',
			},
			request: 'trackConnectReasonClick',
		},
		trackFeatureArticleClick: {
			on: 'click',
			selector: '.featured',
			vars: {
				clickUrl: '${articleUrl}',
				sectionName: 'features',
				eventName: 'PROFILES_FEATURE_ARTICLE_CLICK_AMP',
			},
			request: 'trackCardClick',
		},
		trackCompanyCardClick: {
			on: 'click',
			selector: '.company-card',
			vars: {
				clickUrl: '${companyUrl}',
				eventName: 'PROFILES_COMPANY_CARD_CLICK_AMP',
			},
			request: 'trackCardClick',
		},
		trackLoginButton: {
			on: 'click',
			selector: '.login-element',
			vars: {
				clickText: '${clickText}',
				eventName: 'PROFILES_SOCIAL_LOGIN_CLICK_AMP',
			},
			request: 'trackLoginPlatform',
		},
		seeMoreClick: {
			on: 'click',
			selector: '.see-more',
			vars: {
				clickUrl: '${seeMoreUrl}',
				eventName: 'PROFILES_SEE_MORE_CLICK_AMP',
			},
			request: 'trackSeeMoreClick',
		},
	};
	if (pitchVideo) {
		Object.assign(triggers, pitchVideo.platform === 'jwplayer' ? getJWTriggerBySelector('.jw-1') : getYTTriggerBySelector('.yt-1'));
		Object.assign(triggers, pitchVideo.platform === 'jwplayer' ? {} : defaultYTPercentTriggers(1));
	}
	return triggers;
};

// ------AMP VIDEO ANALYTICS TRIGGERS START

const getAmpVideoAnalyticsTriggers = (snippets) => {
	const triggers = {
		trackPageview: {
			on: 'visible',
			request: 'pageview',
		},
		scrollPings: {
			on: 'scroll',
			scrollSpec: {
				verticalBoundaries: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			},
			vars: {
				pageScroll: '${verticalScrollBoundary}',
			},
			request: 'pageScrollPercent',
		},
		pageTime: {
			on: 'visible',
			visibilitySpec: {
				reportWhen: 'documentExit',
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		pageNewTime: {
			on: 'hidden',
			visibilitySpec: {
				repeat: true,
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		trackSeeLess: {
			on: 'click',
			selector: '.seeLess',
			request: 'trackButtonClick',
			vars: {
				pageUrl: '<%=_hostLink%><%=_slugURL%>/amp%>',
				eventName: 'SEE_LESS_CLICK',
			},
		},
		trackSeeMore: {
			on: 'click',
			selector: '.seeMore',
			request: 'trackButtonClick',
			vars: {
				eventName: 'SEE_MORE_CLICK',
			},
		},
		trackBackToTop: {
			on: 'click',
			selector: '#backToTop',
			request: 'trackButtonClick',
			vars: {
				pageUrl: '<%=_hostLink%><%=_slugURL%>/amp%>',
				eventName: 'BACK_TO_TOP_CLICK',
			},
		},
		trackUpNextClick: {
			on: 'click',
			selector: '.upNextDiv',
			request: 'upnextClickUrl',
			vars: {
				upNextUrl: '${eventUrl}',
				upNextPos: '${clickPosition}',
				eventName: 'UP_NEXT_CLICK',
			},
		},
		trackUpcomingRegister: {
			on: 'click',
			selector: '.registerUpcoming',
			request: 'upcomingRegisterClick',
			vars: {
				upcomingWebinar: '${upcomingTitle}',
				eventName: 'UPCOMING_REGISTER_CLICK',
				cardPosition: '${cardPosition}',
			},
		},
		trackRegister: {
			on: 'click',
			selector: '.registerButton',
			request: 'trackButtonClick',
			vars: {
				eventName: 'REGISTER_CLICK',
			},
		},
		trackQuestionSend: {
			on: 'click',
			selector: '#ques-send',
			request: 'trackButtonClick',
			vars: {
				eventName: 'QUESTION_SEND',
			},
		},
		trackUpComingClick: {
			on: 'click',
			selector: '.upcomingLink',
			request: 'upcomingClickUrl',
			vars: {
				upComingUrl: '${eventUrl}',
				upComingPos: '${clickPosition}',
				eventName: 'UP_COMING_CLICK',
			},
		},
	};

	// Objects generated dynamically based on video availability on AMP side to avoid errors thrown for inexistent classes.
	// Separate trigger created for each selector since multi selector tracking is not supported on AMP yet
	if (snippets && snippets.length) {
		snippets.forEach((item, index) => {
			Object.assign(triggers, item.videoPlatform === 'jwplayer' ? getJWTriggerBySelector(`.jw-${index}`) : getYTTriggerBySelector(`.yt-${index}`));
		});
	}
	return triggers;
};

const getAmpStoryAnalyticsTriggers = (storyData, ytVideoList, jwVideoList) => {
	let articleCategory;
	let authorName;
	let tags;
	let authors;
	let brandName;
	if (storyData.metadata.category) {
		articleCategory = storyData.metadata.category.name;
	} else {
		articleCategory = 'NA';
	}
	tags = storyData.metadata.tags && storyData.metadata.tags.length > 0 ? storyData.metadata.tags.map((tag) => tag.name) : [];
	tags = tags.join('|');
	authors = storyData.metadata.authors && storyData.metadata.authors.length > 0 ? storyData.metadata.authors.map((author) => author.name) : [];
	authors = authors.join('|');
	if (storyData.metadata.authors && storyData.metadata.authors.length > 0) {
		authorName = storyData.metadata.authors[0].name;
	} else {
		authorName = {};
	}
	if (storyData.brand) {
		brandName = storyData.brand.name;
	}
	const triggers = {
		trackPageview: {
			on: 'visible',
			request: 'pageview',
			vars: {
				articleCategory: `${articleCategory}`,
				tags: `${tags}`,
				authors: `${authors}`,
				authorName: `${authorName}`,
				publishedDate: `${storyData.publishedTimestamp}`,
				brandName: `${brandName}`,
			},
		},
		scrollPings: {
			on: 'scroll',
			scrollSpec: {
				verticalBoundaries: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			},
			vars: {
				pageScroll: '${verticalScrollBoundary}',
			},
			request: 'pageScrollPercent',
		},
		pageTime: {
			on: 'visible',
			visibilitySpec: {
				reportWhen: 'documentExit',
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		pageNewTime: {
			on: 'hidden',
			visibilitySpec: {
				repeat: true,
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		trackConnectButtonClick: {
			on: 'click',
			selector: '.company-connect-link',
			vars: {
				eventName: 'ARTICLE_CONNECT_BUTTON_CLICK_AMP',
				sectionName: '${sectionName}',
				companyName: '${companyName}',
			},
			request: 'trackConnectButtonClick',
		},
		trackConnectSubmitClick: {
			on: 'click',
			selector: '#submit-connect-form',
			vars: {
				eventName: 'ARTICLE_CONNECT_SUBMIT_CLICK_AMP',
				sectionName: '${sectionName}',
				companyName: '${companyName}',
			},
			request: 'trackConnectButtonClick',
		},
		trackConnectReasonClick: {
			on: 'click',
			selector: '.connect-reason',
			vars: {
				eventName: 'ARTICLE_CONNECT_REASON_CLICK_AMP',
				connectReason: '${connectReason}',
				companyName: '${companyName}',
			},
			request: 'trackConnectReasonClick',
		},
		trackIButtonClick: {
			on: 'click',
			selector: '.company-widget',
			vars: {
				eventName: 'COMPANY_I_WIDGET_CLICK',
				companyName: '${companyName}',
			},
			request: 'trackCompanyClick',
		},
		trackViewProfileClick: {
			on: 'click',
			selector: '.popup-company-link',
			vars: {
				eventName: 'VIEW_PROFILE_BUTTON_CLICK',
				companyName: '${companyName}',
			},
			request: 'trackCompanyClick',
		},
		trackPaywallLoginClick: {
			on: 'click',
			selector: '.paywallLoginButton',
			vars: {
				eventName: 'PAYWALL_LOGIN_CLICK_AMP',
				clickText: '${clickText}',
			},
			request: 'trackButtonClick',
		},
		trackAlsoReadClick: {
			on: 'click',
			selector: '.also-read',
			vars: {
				eventName: 'ALSO_READ_CLICKS_AMP',
				clickUrl: '${articleUrl}',
			},
			request: 'trackAlsoRead',
		},
		trackLink: {
			on: 'click',
			selector: '.link-click',
			vars: {
				eventName: 'LINK_CLICK_AMP',
				clickUrl: '${clickUrl}',
				articleSection: '${sectionName}',
			},
			request: 'trackLinkCLick',
		},
		clapClick: {
			on: 'click',
			selector: '#clap',
			vars: {
				eventName: 'ARTICLE_CLAP_CLICK',
			},
			request: 'reactionIconClick',
		},
		bookmarkClick: {
			on: 'click',
			selector: '#bookmark',
			vars: {
				eventName: 'ARTICLE_BOOKMARK_CLICK',
			},
			request: 'reactionIconClick',
		},
		shareClick: {
			on: 'click',
			selector: '.social-share',
			vars: {
				eventName: 'ARTICLE_SHARE_CLICK',
				shareMedium: '${mediumName}',
			},
			request: 'shareIconClick',
		},
		eventTrackLink: {
			on: 'click',
			selector: '.event_link',
			vars: {
				eventName: 'EVENT_LINK_CLICK_AMP',
				clickUrl: '${clickUrl}',
				position: '${postion}',
			},
			request: 'trackEventLinkClick',
		},
		eventSponsorTrackLink: {
			on: 'click',
			selector: '.sponsor_link',
			vars: {
				eventName: 'EVENT_LINK_SPONSOR_CLICK_AMP',
				clickUrl: '${clickUrl}',
			},
			request: 'trackEventLinkClick',
		},
	};

	if (ytVideoList && ytVideoList.length) {
		ytVideoList.map((i) => Object.assign(triggers, getYTTriggerBySelector(`.yt-${i}`), defaultYTPercentTriggers(i)));
	}
	if (jwVideoList && jwVideoList.length) {
		jwVideoList.map((i) => Object.assign(triggers, getJWTriggerBySelector(`.jw-${i}`)));
	}
	Object.assign(triggers, getAmpBroadcastAnalyticsTriggers());
	return triggers;
};

const getAmpBroadcastAnalyticsTriggers = () => {
	const trigger = {};
	trigger.broadcastShown = {
		on: 'visible',
		request: 'broadcastShownRequest',
		selector: '#broadcast-close-img',
		visibilitySpec: {
			selector: '#broadcast-close-img',
			visiblePercentageMin: 20,
			totalTimeMin: 500,
			continuousTimeMin: 200,
		},
		vars: {
			eventName: 'toast_msg_display',
			broadcastId: '${broadcastId}',
			broadcastTitle: '${broadcastTitle}',
			mobileDelay: '${mobileDelay}',
			desktopDelay: '${desktopDelay}',
			startTime: '${startTime}',
		},
	};
	trigger.broadcastClosed = {
		on: 'click',
		request: 'broadcastClosedRequest',
		selector: '#broadcast-toast .broadcast-close-icon',
		vars: {
			eventName: 'toast_msg_cancel_click',
			broadcastId: '${broadcastId}',
			broadcastTitle: '${broadcastTitle}',
			startTime: '${startTime}',
		},
	};
	trigger.broadcastLinkClick = {
		on: 'click',
		request: 'broadcastLinkClickRequest',
		selector: '#broadcast-toast p a',
		vars: {
			eventName: 'toast_msg_hyperlink_click',
			broadcastId: '${broadcastId}',
			broadcastTitle: '${broadcastTitle}',
			clickURL: '${url}',
			startTime: '${startTime}',
		},
	};
	return trigger;
};

const getJWTriggerBySelector = (selector, uniqueId) => {
	if (uniqueId === undefined || uniqueId === null) {
		uniqueId = selector;
	}
	const trigger = {};
	trigger[`JWVideoPlay-${uniqueId}`] = {
		on: 'video-play',
		request: 'jwAction',
		selector: `${selector}`,
		vars: {
			eventName: 'tvc_video_interaction_amp',
			eventAction: 'tvc_jw_video_play',
			playedTotal: `VIDEO_STATE(${selector}, playedTotal)`,
			currentTime: `VIDEO_STATE(${selector}, currentTime)`,
			duration: `VIDEO_STATE(${selector}, duration)`,
			videoTitle: '${videoTitle}',
			mediaId: '${mediaId}',
		},
	};

	trigger[`JWVideoPause-${uniqueId}`] = {
		on: 'video-pause',
		request: 'jwAction',
		selector: `${selector}`,
		vars: {
			eventName: 'tvc_video_interaction_amp',
			eventAction: 'tvc_jw_video_pause',
			playedTotal: `VIDEO_STATE(${selector}, playedTotal)`,
			currentTime: `VIDEO_STATE(${selector}, currentTime)`,
			duration: `VIDEO_STATE(${selector}, duration)`,
			videoTitle: '${videoTitle}',
			mediaId: '${mediaId}',
		},
	};

	trigger[`JWPercentage-${uniqueId}`] = {
		on: 'video-percentage-played',
		request: 'jwPercent',
		selector: `${selector}`,
		videoSpec: {
			percentages: [25, 50, 75, 90, 100],
		},
		vars: {
			eventName: 'tvc_jw_video_progress_amp',
			playedTotal: `VIDEO_STATE(${selector}, playedTotal)`,
			currentTime: `VIDEO_STATE(${selector}, currentTime)`,
			duration: `VIDEO_STATE(${selector}, duration)`,
			videoTitle: '${videoTitle}',
			mediaId: '${mediaId}',
		},
	};

	return trigger;
};

const getYTTriggerBySelector = (selector, uniqueId) => {
	if (uniqueId === undefined || uniqueId === null) {
		uniqueId = selector;
	}
	const trigger = {};
	trigger[`YTVideoPlay-${uniqueId}`] = {
		on: 'video-play',
		request: 'ytAction',
		selector: `${selector}`,
		vars: {
			eventName: 'youtube_video_amp',
			eventAction: 'Play',
			videoTitle: '${videoTitle}',
			mediaId: '${mediaId}',
		},
	};

	trigger[`YTVideoPause-${uniqueId}`] = {
		on: 'video-pause',
		request: 'ytAction',
		selector: `${selector}`,
		vars: {
			eventName: 'youtube_video_amp',
			eventAction: 'Pause',
			videoTitle: '${videoTitle}',
			mediaId: '${mediaId}',
		},
	};

	return trigger;
};

const defaultYTPercentTriggers = (position) => {
	// creating new trigger object for each percent as it's not possible to send percent/duration for youtube videos
	const trackedPercentages = [10, 20, 25, 40, 50, 60, 75, 80, 90, 100];
	const triggers = {};

	trackedPercentages.forEach((percent, index) => {
		triggers[`YTPercentPlayed${index}`] = {
			on: 'video-percentage-played',
			request: 'ytAction',
			selector: `.yt-${position}`,
			videoSpec: {
				percentages: [percent],
			},
			vars: {
				eventName: 'youtube_video_amp',
				eventAction: `${percent}% Watched`,
				videoTitle: '${videoTitle}',
				mediaId: '${mediaId}',
			},
		};
	});
	return triggers;
};

// ------AMP VIDEO ANALYTICS TRIGGERS END

const getAmpYSInsightsLandingAnalyticsTriggers = (clipOfDay, bucketTopicData) => {
	const triggers = {
		trackPageview: {
			on: 'visible',
			request: 'pageview',
			vars: {
				brandName: 'YourStory',
			},
		},
		scrollPings: {
			on: 'scroll',
			scrollSpec: {
				verticalBoundaries: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			},
			vars: {
				pageScroll: '${verticalScrollBoundary}',
			},
			request: 'pageScrollPercent',
		},
		pageTime: {
			on: 'visible',
			visibilitySpec: {
				reportWhen: 'documentExit',
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		pageNewTime: {
			on: 'hidden',
			visibilitySpec: {
				repeat: true,
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		baseEvent: {
			on: 'click',
			selector: '.baseEvent',
			request: 'baseEvent',
			vars: {
				eventName: '${eventName}',
			},
		},
		baseClick: {
			on: 'click',
			selector: '.baseClick',
			request: 'baseClick',
			vars: {
				eventName: '${eventName}',
				clickText: '${clickText}',
			},
		},
		shareIcon: {
			on: 'click',
			selector: '.shareIcon',
			request: 'shareIcon',
			vars: {
				eventName: 'SHARE_BUTTON_CLICK',
				shareMedium: '${shareMedium}',
				videoPosition: '${pos}',
				videoURL: '${shareUrl}',
			},
		},
		codPrev: {
			on: 'click',
			selector: '.codPrev',
			request: 'codBtnClick',
			vars: {
				sectionName: 'CLIP OF THE DAY',
				videoURL: '${currentVideoUrl}',
				eventName: 'PREVIOUS_CLICK',
				videoPos: '${videoPosition}',
			},
		},
		codNext: {
			on: 'click',
			selector: '.codNext',
			request: 'codBtnClick',
			vars: {
				sectionName: 'CLIP OF THE DAY',
				videoURL: '${currentVideoUrl}',
				eventName: 'NEXT_CLICK',
				videoPos: '${videoPosition}',
			},
		},
		influencerClick: {
			on: 'click',
			selector: '.influDetails',
			request: 'influBtnClick',
			vars: {
				sectionName: 'Featured Influencers',
				position: '${pos}',
				eventName: 'INFLUENCER_CLICK',
				clickURL: '${influencerSlug}',
			},
		},
		bucketTopicClick: {
			on: 'click',
			selector: '.tpName',
			request: 'topicBtnClick',
			vars: {
				eventName: 'TOPIC_CLICK',
				pos: '${position}',
				sectionName: '${sectionName}',
				clickText: '${clickText}',
				subsectionName: '${subsectionName}',
			},
		},
		topicViewAllClick: {
			on: 'click',
			selector: '.viewAllTopic',
			request: 'topicViewBtnClick',
			vars: {
				eventName: 'VIEW_ALL',
				clickURL: '${topicUrl}',
				sectionName: '${sectionName}',
				clickText: '${clickText}',
				subsectionName: '${subsectionName}',
			},
		},
		forwardCauClick: {
			on: 'click',
			selector: '.cauNavigator',
			request: 'cauNavigator',
			vars: {
				eventName: 'HORIZONTAL_NAVIGATION_ARROW_CLICKS',
				sectionName: '${sectionName}',
				arrowDirection: '${arrowDirection}',
			},
		},
		playVideo: {
			on: 'click',
			selector: '.playVideo',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_Play_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoCardClick: {
			on: 'click',
			selector: '.videoTitle',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_VideoTitle_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoCardImgClick: {
			on: 'click',
			selector: '.videoImg',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_VideoImage_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		topicClick: {
			on: 'click',
			selector: '.topicName',
			request: 'topicClick',
			vars: {
				eventName: 'TOPICS_CLICK',
				clickUrl: '${clickUrl}',
				topicLabel: '${topicLable}',
				clickText: '${clickText}',
				bucketName: '${bucketName}',
				position: '${position}',
			},
		},
		viewMoreTopicClick: {
			on: 'click',
			selector: '.seeMoreTopics',
			request: 'seeMoreTopics',
			vars: {
				eventName: 'SEE_MORE_TOPICS',
				clickText: '${clickText}',
				bucketName: '${bucketName}',
			},
		},
		suggestNow: {
			on: 'click',
			selector: '.suggestNow',
			request: 'baseEvent',
			vars: {
				eventName: '${eventName}',
			},
		},
		linkClicks: {
			on: 'click',
			selector: '.linkEvent',
			request: 'linkEvent',
			vars: {
				eventName: 'FOOTER_CLICKS',
				clickUrl: '${clickUrl}',
				clickText: '${clickText}',
			},
		},
	};

	// Objects generated dynamically based on video availability on AMP side to avoid errors thrown for inexistent classes.
	// Separate trigger created for each selector since multi selector tracking is not supported on AMP yet
	if (clipOfDay && clipOfDay.length) {
		clipOfDay.forEach((video, videoIndex) => {
			if (video.videoPlatform === 'jwplayer') {
				Object.assign(triggers, getJWTriggerBySelector(`#clip-index-0-${videoIndex} amp-jwplayer`, `cod-${videoIndex}`));
			} else if (video.videoPlatform === 'youtube') {
				Object.assign(triggers, getYTTriggerBySelector(`#clip-index-0-${videoIndex} amp-youtube`, `cod-${videoIndex}`));
			}
		});
	}
	if (bucketTopicData && bucketTopicData.length) {
		bucketTopicData.forEach((bucket, bucketIndex) => {
			const video = bucket && bucket.topics && bucket.topics[0] && bucket.topics[0].video;
			if (video && video.videoPlatform === 'jwplayer') {
				Object.assign(triggers, getJWTriggerBySelector(`#initial-video-view-${bucketIndex} amp-jwplayer`, `bucket-video-${bucketIndex}`));
			} else if (video && video.videoPlatform === 'youtube') {
				Object.assign(triggers, getYTTriggerBySelector(`#initial-video-view-${bucketIndex} amp-youtube`, `bucket-video-${bucketIndex}`));
			}
		});
	}

	return triggers;
};

const getAmpInfluencerAnalyticsTriggers = (videos) => {
	const triggers = {
		trackPageview: {
			on: 'visible',
			request: 'pageview',
			vars: {
				brandName: 'YourStory',
			},
		},
		scrollPings: {
			on: 'scroll',
			scrollSpec: {
				verticalBoundaries: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			},
			vars: {
				pageScroll: '${verticalScrollBoundary}',
			},
			request: 'pageScrollPercent',
		},
		pageTime: {
			on: 'visible',
			visibilitySpec: {
				reportWhen: 'documentExit',
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		pageNewTime: {
			on: 'hidden',
			visibilitySpec: {
				repeat: true,
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		baseEvent: {
			on: 'click',
			selector: '.baseEvent',
			request: 'baseEvent',
			vars: {
				eventName: '${eventName}',
			},
		},
		shareIcon: {
			on: 'click',
			selector: '.shareIcon',
			request: 'shareIcon',
			vars: {
				eventName: 'SHARE_BUTTON_CLICK',
				shareMedium: '${shareMedium}',
				videoPosition: '${pos}',
				videoURL: '${shareUrl}',
			},
		},
		socialMediaClick: {
			on: 'click',
			selector: '.socialLink',
			request: 'socialLinkEvent',
			vars: {
				eventName: 'SocialMedia_CTA_Clicks',
				socialMedia: '${socialMedia}',
				socialLink: '${socialLink}',
			},
		},
		forwardCauClick: {
			on: 'click',
			selector: '.cauNavigator',
			request: 'cauNavigator',
			vars: {
				eventName: 'HORIZONTAL_NAVIGATION_ARROW_CLICKS',
				sectionName: '${sectionName}',
				arrowDirection: '${arrowDirection}',
			},
		},
		playVideo: {
			on: 'click',
			selector: '.playVideo',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_Play_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoTitleClick: {
			on: 'click',
			selector: '.videoTitle',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_VideoTitle_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoCardClick: {
			on: 'click',
			selector: '.videoCard',
			request: 'playVideo',
			vars: {
				eventName: 'VIDEO_CARD',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoCardImgClick: {
			on: 'click',
			selector: '.videoImg',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_VideoImage_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		topicClick: {
			on: 'click',
			selector: '.topicName',
			request: 'topicClick',
			vars: {
				eventName: 'TOPICS_CLICK',
				clickUrl: '${clickUrl}',
				topicLabel: '${topicLable}',
				clickText: '${clickText}',
				bucketName: '${bucketName}',
				position: '${position}',
			},
		},
		viewMoreTopicClick: {
			on: 'click',
			selector: '.seeMoreTopics',
			request: 'seeMoreTopics',
			vars: {
				eventName: 'SEE_MORE_TOPICS',
				clickText: '${clickText}',
				bucketName: '${bucketName}',
			},
		},
		suggestNow: {
			on: 'click',
			selector: '.suggestNow',
			request: 'baseEvent',
			vars: {
				eventName: '${eventName}',
			},
		},
		linkClicks: {
			on: 'click',
			selector: '.linkEvent',
			request: 'linkEvent',
			vars: {
				eventName: 'FOOTER_CLICKS',
				clickUrl: '${clickUrl}',
				clickText: '${clickText}',
			},
		},
	};
	// Objects generated dynamically based on video availability on AMP side to avoid errors thrown for inexistent classes.
	// Separate trigger created for each selector since multi selector tracking is not supported on AMP yet
	if (videos && videos.length) {
		videos.forEach((video, index) => {
			if (video.videoPlatform === 'jwplayer') {
				Object.assign(triggers, getJWTriggerBySelector(`#topic-video-${index} amp-jwplayer`, `topic-video-${index}`));
			} else if (video.videoPlatform === 'youtube') {
				Object.assign(triggers, getYTTriggerBySelector(`#topic-video-${index} amp-youtube`, `topic-video-${index}`));
			}
		});
	}
	return triggers;
};

const getAmpTopicAnalyticsTriggers = (videos) => {
	const triggers = {
		trackPageview: {
			on: 'visible',
			request: 'pageview',
			vars: {
				brandName: 'YourStory',
			},
		},
		scrollPings: {
			on: 'scroll',
			scrollSpec: {
				verticalBoundaries: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
			},
			vars: {
				pageScroll: '${verticalScrollBoundary}',
			},
			request: 'pageScrollPercent',
		},
		pageTime: {
			on: 'visible',
			visibilitySpec: {
				reportWhen: 'documentExit',
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		pageNewTime: {
			on: 'hidden',
			visibilitySpec: {
				repeat: true,
			},
			vars: {
				spentTime: '${totalEngagedTime}',
			},
			request: 'pageSpentTime',
		},
		baseEvent: {
			on: 'click',
			selector: '.baseEvent',
			request: 'baseEvent',
			vars: {
				eventName: '${eventName}',
			},
		},
		shareIcon: {
			on: 'click',
			selector: '.shareIcon',
			request: 'shareIcon',
			vars: {
				eventName: 'SHARE_BUTTON_CLICK',
				shareMedium: '${shareMedium}',
				videoPosition: '${pos}',
				videoURL: '${shareUrl}',
			},
		},
		followClick: {
			on: 'click',
			selector: '.followBtn',
			request: 'followEvent',
			vars: {
				eventName: 'FOLLOW_UNFOLLOW_CLICK',
				clickText: '${clickText}',
			},
		},
		forwardCauClick: {
			on: 'click',
			selector: '.cauNavigator',
			request: 'cauNavigator',
			vars: {
				eventName: 'HORIZONTAL_NAVIGATION_ARROW_CLICKS',
				sectionName: '${sectionName}',
				arrowDirection: '${arrowDirection}',
			},
		},
		playVideo: {
			on: 'click',
			selector: '.playVideo',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_Play_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoTitleClick: {
			on: 'click',
			selector: '.videoTitle',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_VideoTitle_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		speakerClick: {
			on: 'click',
			selector: '.speakerDetails',
			request: 'speakerClick',
			vars: {
				sectionName: 'Speakers',
				pos: '${position}',
				eventName: 'INFLUENCER_CLICK',
				clickURL: '${influUrl}',
			},
		},
		videoCardClick: {
			on: 'click',
			selector: '.videoCard',
			request: 'playVideo',
			vars: {
				eventName: 'VIDEO_CARD',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		videoCardImgClick: {
			on: 'click',
			selector: '.videoImg',
			request: 'playVideo',
			vars: {
				eventName: 'VideoCard_VideoImage_Click',
				videoURL: '${videoUrl}',
				sectionName: '${sectionName}',
				position: '${position}',
			},
		},
		topicClick: {
			on: 'click',
			selector: '.topicName',
			request: 'topicClick',
			vars: {
				eventName: 'TOPICS_CLICK',
				clickUrl: '${clickUrl}',
				topicLabel: '${topicLable}',
				clickText: '${topicLable}',
				bucketName: '${bucketName}',
				position: '${position}',
			},
		},
		viewMoreTopicClick: {
			on: 'click',
			selector: '.seeMoreTopics',
			request: 'seeMoreTopics',
			vars: {
				eventName: 'SEE_MORE_TOPICS',
				clickText: '${clickText}',
				bucketName: '${bucketName}',
			},
		},
		suggestNow: {
			on: 'click',
			selector: '.suggestNow',
			request: 'baseEvent',
			vars: {
				eventName: '${eventName}',
			},
		},
		linkClicks: {
			on: 'click',
			selector: '.linkEvent',
			request: 'linkEvent',
			vars: {
				eventName: 'FOOTER_CLICKS',
				clickUrl: '${clickUrl}',
				clickText: '${clickText}',
			},
		},
	};

	// Objects generated dynamically based on video availability on AMP side to avoid errors thrown for inexistent classes.
	// Separate trigger created for each selector since multi selector tracking is not supported on AMP yet
	if (videos && videos.length) {
		videos.forEach((video, index) => {
			if (video.videoPlatform === 'jwplayer') {
				Object.assign(triggers, getJWTriggerBySelector(`#topic-video-${index} amp-jwplayer`, `topic-video-${index}`));
			} else if (video.videoPlatform === 'youtube') {
				Object.assign(triggers, getYTTriggerBySelector(`#topic-video-${index} amp-youtube`, `topic-video-${index}`));
			}
		});
	}
	return triggers;
};

const getVideoInstrumentationByVideoPlatform = (videoTypes, sectionName, prefix, pageName) => {
	if (videoTypes && videoTypes.length) {
		const triggers = {};
		videoTypes.forEach((videoPlatform, index) => {
			if (videoPlatform === '1') Object.assign(triggers, getJWTriggerBySelector(`#jw-${sectionName}-${index}`, `jw-${sectionName}-${index}`));
			if (videoPlatform === '2') Object.assign(triggers, getYTTriggerBySelector(`#yt-${sectionName}-${index}`, `yt-${sectionName}-${index}`));
			return null;
		});
		const videoInstrumentation = {
			requests: {
				baseTrack: 'https://api.factors.ai/sdk/amp/event/track?token=${token}&title=${title}&referrer=${documentReferrer}&client_id=${clientId(_factorsai_amp_id)}&source_url=${sourceUrl}&pageURL=${sourceUrl}',
				baseEvent: `\${baseTrack}&event_name=\${eventName}&prefix=${prefix}&pageName=${pageName}`,
				jwPercent: '${baseEvent}&duration=${duration}&playedTotal=${playedTotal}&currentTime=${currentTime}&pageLoadTime=${pageLoadTime}&mediaId=${mediaId}&videoTitle=${videoTitle}',
				jwAction: '${baseEvent}&tvc_video_status_dlv=${eventAction}&playedTotal=${playedTotal}&currentTime=${currentTime}&duration=${duration}&pageLoadTime=${pageLoadTime}&mediaId=${mediaId}&videoTitle=${videoTitle}',
				ytAction: '${baseEvent}&Actions=${eventAction}&videoTitle=${videoTitle}&pageLoadTime=${pageLoadTime}&mediaId=${mediaId}',
				linkEvent: '${baseEvent}&clickUrl=${clickUrl}&clickText=${clickText}',
			},
			vars: {
				token: '8cl4l0gk3my3hpkhzowsaqqqiswfsqwz',
			},
			triggers,
		};
		return videoInstrumentation;
	}
	return [];
};

// Amp Optimiizer
const ampOptimizer = AmpOptimizer.create({
	verbose: process.env.NODE_ENV === 'development',
});

module.exports = {
	formatStoryAmp,
	getAmpContent,
	getAmpSchemaObject,
	getCompanyAmpSchemaObject,
	getAmpVideoAnalyticsTriggers,
	getAmpStoryAnalyticsTriggers,
	getAmpYSInsightsLandingAnalyticsTriggers,
	getAmpInfluencerAnalyticsTriggers,
	getAmpTopicAnalyticsTriggers,
	getYTTriggerBySelector,
	getJWTriggerBySelector,
	defaultYTPercentTriggers,
	getVideoInstrumentationByVideoPlatform,
	getAmpBroadcastAnalyticsTriggers,
	ampOptimizer,
};
