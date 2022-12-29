import logger from './logger';

const _ = require('lodash');
const moment = require('moment');
const cheerio = require('cheerio');
const { multipleAuthorMetaById } = require('../services/AuthorMeta/functions');
const { multipleTagsById } = require('../services/Tags/functions');
const { categoriesByIds } = require('../services/Categories/functions');
const { curatedInterestsByIds } = require('../services/CuratedInterests/functions');
const { dynamicConfigurationsByNamespace, dynamicConfigurationByKey } = require('../services/DynamicConfigurations/functions');

const { assetsByStoryId } = require('../services/Assets/functions');
const { webinarByStoryId } = require('../services/Webinars/functions');
const { videoSnippetsByStoryId } = require('../services/VideoSnippets/functions');

const parser = require('../parser/index');
const { brandById, brandsByIds } = require('../services/Brands/functions');
const { getStoryConnectCompany } = require('../services/Stories/functions');
const { storyMetaDataByStoryId, storyMetadataByStoryIdAndKey } = require('../services/StoryMetadata/functions');
const dbServices = require('../dao/queries/index');
const { convertSecondsToISO8601, arrayToObject } = require('./common');
const { getMultipleListItemsByIds } = require('../services/CuratedList/functions');
const { companyById, companySectors } = require('../services/Companies/functions');
const { companyPeopleByCompanyId } = require('../services/CompanyPeople/functions');

const SERVICE_PWA = process.env.SERVICE_PWA;
const { accessPaidContent } = require('./userAccess');
const { secondsToHhmmss } = require('./utility_function');
const { fetchCuratedListItemById } = require('../services/CuratedList/functions');

const formatStory = async ({
	story, metadata, brand, format, series, bodyExcerpt, forSeries, assets, webinar, videoSnippets, lazyMedia, inArticleAdConfig, articleEndCTAHtml, connectCompany, hasAccessToRead,
}) => {
	const brandObject = parser.brand.brandInfo(brand, format);
	brandObject.path = getBrandPath(brand.slug);
	const metaObject = parser.storyMeta.storyMetaInfo({ storymeta: metadata, format, storyType: story.type });
	if ([2, 120, 121].includes(brand.id) && format === 'minimal') {
		metaObject.tags = metadata.tags;
	}
	if (metaObject.tags && metaObject.tags.length > 0) {
		const tagMeta = metaObject.tags.filter((e) => e).map((item) => ({ ...parser.tag.tagInfo(item, format), path: getTagPath(brandObject.slug, item.slug) }));
		metaObject.tags = tagMeta;
	} else {
		metaObject.tags = [];
	}
	if (metaObject.authors && metaObject.authors.length > 0) {
		const authorMeta = metaObject.authors.filter((e) => e).map((item) => ({ ...parser.authorMeta.authorMetaInfo(item, format), path: getAuthorPath(item.username) }));
		metaObject.authors = authorMeta;
	} else {
		metaObject.authors = [];
	}
	if (metaObject.brandSpotlight) {
		metaObject.brandSpotlight = parser.brandSpotlight.brandSpotlightInfo(metaObject.brandSpotlight, format);
	}
	if (metaObject.category) {
		metaObject.category = { ...parser.category.categoryInfo(metaObject.category, format), path: getCategoryPath(brandObject.slug, metaObject.category.slug) };
	} else if (brandObject.slug !== 'herstory' && brandObject.slug !== 'socialstory' && brandObject.slug !== 'mystory' && brandObject.slug !== 'smbstory' && brandObject.slug !== 'germany' && brandObject.slug !== 'journal' && brandObject.slug !== 'hindi' && brandObject.slug !== 'tamil' && brandObject.slug !== 'korea' && brandObject.slug !== 'weekender') {
		metaObject.category = brandObject;
	}
	if (metaObject.reactions) {
		metaObject.reactions = parser.contentReactions.contentReactionInfo(metaObject.reactions);
	}
	if (metaObject.duration) {
		metaObject.duration = parseInt(metaObject.duration);
		metaObject.duration_iso = convertSecondsToISO8601(metaObject.duration);
	}
	const storyObject = parser.story.storyInfo(story, format);
	storyObject.brand = brandObject;
	storyObject.metadata = metaObject;
	if (videoSnippets && videoSnippets.length > 0) {
		const snippets = videoSnippets.filter((e) => e.type === 'SNIPPET');
		const trailers = videoSnippets.filter((e) => e.type === 'TRAILER');
		const snippetsList = snippets && snippets.length > 0 ? snippets.map((item) => ({ ...parser.videoSnippet.videoSnippetInfo({ videoSnippet: item }), videoLink: parser.video.getVideoFile(item.videoPlatform, item.videoId) })) : null;
		const trailersList = trailers && trailers.length > 0 ? trailers.map((item) => ({ ...parser.videoSnippet.videoSnippetInfo({ videoSnippet: item }), videoLink: parser.video.getVideoFile(item.videoPlatform, item.videoId) })) : null;
		storyObject.snippets = snippetsList;
		storyObject.trailers = trailersList;
	} else {
		storyObject.snippets = null;
		storyObject.trailers = null;
	}
	storyObject.path = story.publishedUrl;
	storyObject.featured = story.featured;
	if (`${story.brand}` !== '158') {
		storyObject.mobilePostJson = (story.mobilePostJson) ? await formatMobilePostJson(story.id, story.mobilePostJson, (!hasAccessToRead && metadata.paywallType === 'subscription') ? metadata.paywallLimit : null) : null;
	}
	storyObject.timeLapsed = moment(story.publishedAt).utcOffset(330).format('Do MMM YYYY');
	storyObject.publishedDate = moment(story.publishedAt).utcOffset(330).format('MMMM DD, YYYY');
	if (story.type === 'VIDEO') {
		if (series && !forSeries) {
			storyObject.series = parser.series.seriesInfo(series.toJSON());
		}
		storyObject.mediaId = story.mediaId;
		storyObject.videoPlatform = story.videoPlatform;
		storyObject.videoLink = parser.video.getVideoFile(story.videoPlatform, story.mediaId);
	} else if (story.type === 'WEBINAR') {
		storyObject.webinar = webinar ? parser.webinar.webinarInfo({ webinar }) : undefined;
		storyObject.mediaId = story.mediaId;
		storyObject.videoPlatform = story.videoPlatform;
		storyObject.videoLink = parser.video.getVideoFile(story.videoPlatform, story.mediaId);
	}
	if (bodyExcerpt) {
		storyObject.bodyExcerpt = getFirstParagraph(story.postContent);
	}
	const isCompanyConnectAvailable = connectCompany && connectCompany.length === 1 && connectCompany[0] && connectCompany[0].id;
	if (storyObject.postContent) {
		let imgAssets = {};
		if (assets && assets.length > 0) {
			imgAssets = arrayToObject(assets, 'slug');
		}

		if (!hasAccessToRead && storyObject.protected) {
			storyObject.postContent = formatPaywallStoryPostContent(storyObject.postContent, metadata.paywallLimit);
		}
		storyObject.postContent = formatStoryPostContent(storyObject.postContent, metaObject.guestAuthor, storyObject.id, storyObject.metadata, imgAssets, lazyMedia, story.type, inArticleAdConfig, isCompanyConnectAvailable, hasAccessToRead);

		storyObject.hasAccessToRead = hasAccessToRead;
		storyObject.paywallSubtype = metadata.paywallSubtype;
		storyObject.subscriptionDetails = metadata.subscriptionDetails;
	}
	storyObject.paywallType = metadata.paywallType;
	if (storyObject.paywallType) {
		delete storyObject.metadata.plainText;
		delete storyObject.metadata.audioFile;
	} else if (storyObject.metadata.plainText) {
		if (metaObject.editors && metaObject.editors.length) {
			let editors = '';
			if (metaObject.editors.length > 1) {
				metaObject.editors.forEach((editor, index) => {
					if (index === metaObject.editors.length - 1) {
						editors = editors.concat(`and ${editor.name}`);
					} else editors = editors.concat(`${editor.name}${metaObject.editors.length - 2 === index ? ' ' : ', '}`);
				});
			} else {
				editors = metaObject.editors[0].name;
			}
			storyObject.metadata.plainText = `${storyObject.metadata.plainText} (Edited by ${editors})`;
		}
		if (metaObject.guestAuthor) {
			storyObject.metadata.plainText = `${storyObject.metadata.plainText} (Disclaimer: The views and opinions expressed in this article are those of the author and do not necessarily reflect the views of YourStory.)\n`;
		}
	}
	if (storyObject.type === 'RICH' && articleEndCTAHtml) {
		storyObject.articleEndCTAHtml = articleEndCTAHtml;
	}
	if (isCompanyConnectAvailable) {
		storyObject.metadata.connectCompany = {
			id: connectCompany[0].id,
			slug: connectCompany[0].slug,
			name: connectCompany[0].name,
		};
	}
	// Editors Pick Data keys
	storyObject.editorsPickTitle = metadata.editorsPickTitle;
	storyObject.editorsPickSubtitle = metadata.editorsPickSubtitle;
	storyObject.editorsPickStartTime = metadata.editorsPickStartTime;
	storyObject.editorsPickEndTime = metadata.editorsPickEndTime;
	storyObject.editorsPickParentUrl = metadata.editorsPickParentUrl;
	return storyObject;
};

const getFirstParagraph = (htmlText) => {
	const $ = cheerio.load(htmlText);
	const p = $('p').first();
	return p.text();
};

const formatStoryApp = async (story) => {
	try {
		const postData = {
			post_name: story.slug,
			post_title: story.title,
			post_date: (new Date(story.publishedAt)).getTime(),
			featured_image: story.metadata.media,
		};
		postData.excerpt = story.metadata.excerpt;
		postData.author = story.metadata.authors && story.metadata.authors && story.metadata.authors[0] ? parser.app.userInfoAppV2(story.metadata.authors[0]) : undefined;
		postData.post_link = `${story.path}/`;
		postData.primary_category = story.metadata.category;
		postData.articleTopics = story.metadata.articleTopics;
		postData.richArticleTopics = story.metadata.richArticleTopics;
		return postData;
	} catch (err) {
		logger.error(`Format Story App Data error (id = ${story.id})`, err);
		return {};
	}
};

const createStoryObject = async ({
	story, defaultBrand = null, app = false, format = null, preview = false, bodyExcerpt, forSeries, lazyMedia = false, userId = null, userAgent = '',
}) => {
	try {
		const [brand, metadata, series, assets, webinar, videoSnippets, inArticleAdConfiguration, articleEndCTAHtml, connectCompany] = await Promise.all([
			defaultBrand !== null ? defaultBrand : brandById(story.brand),
			preview ? storyMetaDataByStoryId(story.storyId) : storyMetaDataByStoryId(story.id),
			story.type === 'VIDEO' && story.seriesId && !forSeries ? dbServices.series.getSeriesById(story.seriesId) : undefined,
			story.type === 'WEBINAR' || format === 'minimal' ? undefined : assetsByStoryId(story.id, null, null),
			story.type === 'WEBINAR' ? webinarByStoryId({ storyId: story.id }) : undefined,
			videoSnippetsByStoryId({ storyId: story.id }),
			dynamicConfigurationsByNamespace('YourStory.com-InArticleAdConfig'),
			dynamicConfigurationByKey({ key: 'article_end_cta_html' }),
			story.type === 'RICH' && format !== 'minimal' ? getStoryConnectCompany({ storyId: story.id }) : undefined,
		]);
		const inArticleAdConfig = { first_ad_insert_word_limit: 50, ad_insert_word_limit: 100 };
		if (inArticleAdConfiguration && inArticleAdConfiguration.length) {
			inArticleAdConfiguration.forEach((item) => {
				const wordCount = Number(item.value);
				if (!_.isNaN(wordCount)) {
					if (item.key === 'first_ad_insert_word_limit') {
						inArticleAdConfig.first_ad_insert_word_limit = wordCount;
					} else if (item.key === 'ad_insert_word_limit') {
						inArticleAdConfig.ad_insert_word_limit = wordCount;
					}
				}
			});
		}
		if (userAgent === 'cXensebot') {
			story.protected = false;
		}
		let hasAccessToRead = !story.protected;
		if (story.protected) {
			let access = false;
			try {
				access = await accessPaidContent(userId, metadata.paywallType, metadata.paywallSubtype, story.id);
			} catch (error) {
				logger.error(`Error fetching user access for story: [${story.id}], user: [${userId}]`, error);
				access = false;
			}
			if (access) hasAccessToRead = true;
		}
		let storyData = await formatStory({
			story,
			metadata,
			brand,
			format,
			series,
			bodyExcerpt,
			forSeries,
			assets,
			webinar,
			videoSnippets,
			lazyMedia,
			inArticleAdConfig,
			articleEndCTAHtml: articleEndCTAHtml && articleEndCTAHtml.value ? articleEndCTAHtml.value : null,
			connectCompany,
			hasAccessToRead,
		});
		if (app) {
			storyData = formatStoryApp(storyData);
		}
		return storyData;
	} catch (err) {
		logger.error(`Create story object error (story = ${JSON.stringify(story)}, defaultBrand = ${JSON.stringify(defaultBrand)}, app = ${app}, format = ${format})`, err);
		throw new Error(err);
	}
};

const createStoriesArray = async ({
	stories, defaultBrand = null, app = false, format = 'minimal', bodyExcerpt = false, forSeries,
}) => {
	const storiesFormatted = stories.map(async (story) => {
		const storyInfo = await createStoryObject({
			story, defaultBrand, app, format, bodyExcerpt, forSeries,
		});
		return storyInfo;
	});
	try {
		const storiesData = await Promise.all(storiesFormatted);
		return storiesData;
	} catch (err) {
		logger.error(`Create stories array error (stories = ${JSON.stringify(stories)}, defaultBrand = ${JSON.stringify(defaultBrand)}, app = ${app}, format = ${format})`, err);
		throw new Error(err);
	}
};

const getAuthorPath = (author) => `/author/${author}`;

const getCategoryPath = (brand, category) => {
	if (brand !== 'yourstory') {
		return `/${brand}/category/${category}`;
	}
	return `/category/${category}`;
};

const getTagPath = (brand, tag) => {
	if (brand !== 'yourstory') {
		return `/${brand}/tag/${tag}`;
	}
	return `/tag/${tag}`;
};

const getBrandPath = (brand) => {
	if (brand === 'yourstory') {
		return '/';
	}
	return `/${brand}`;
};

const trimLineBreaks = ($) => {
	const last = $('.quill-content p').last().children().get(0);
	const first = $('.quill-content p').first().children().get(0);
	if (last && last.name === 'br') {
		$('.quill-content p').last().remove();
		trimLineBreaks($);
	} else if (first && first.name === 'br') {
		$('.quill-content p').first().remove();
		trimLineBreaks($);
	}
	return null;
};

const formatMobilePostJson = async (storyId, originalMobilePostJson, paywallLimit) => {
	const textLimit = (paywallLimit) ? Number(paywallLimit) : null;
	let textCount = 0;
	let visitedCompanies = {};
	let mobilePostJson = [];
	try {
		const companyConnect = (storyId) ? await getStoryConnectCompany({ storyId }) : null;
		const isCompanyConnectAvailable = companyConnect && companyConnect.length === 1 && companyConnect[0] && companyConnect[0].id;
		const companyConnectWidget = isCompanyConnectAvailable ? { contentType: 'companyConnect', value: { ...companyConnect[0] } } : null;
		let companyConnectWidgetWordCount = 0;
		// Ordered List Vars
		let orderListCount = 0;
		let orderListStarted = false;
		for (let i = 0; i < originalMobilePostJson.length; i++) {
			if (paywallLimit && textCount >= textLimit) break;
			let data = originalMobilePostJson[i];
			let splitText = null;
			if (data.contentType === 'companyWidget' && data.value && data.value.id) {
				let companyWidget = { ...data };
				if (visitedCompanies[data.value.id]) {
					companyWidget = visitedCompanies[data.value.id];
				} else {
					const companyDetails = await getCompanyWidgetDetails(data.value.id);
					if (companyDetails) {
						companyWidget.value = companyDetails;
					} else {
						const company = await companyById(data.value.id);
						if (company && company.name) {
							companyWidget = { ...companyWidget, contentType: 'text', value: { ...data.value, data: company.name, format: {} } };
							splitText = companyWidget.value.data.split(' ');
						}
					}
				}
				visitedCompanies = { ...visitedCompanies, [data.value.id]: companyWidget };
				data = companyWidget;
			} else
			if (data.contentType === 'text' && data.value && data.value.data) {
				splitText = data.value.data.split(' ');
				if (paywallLimit) {
					let currentText = '';
					const textArray = data.value.data.split('\n');
					for (let val = 0; val < textArray.length && textCount < textLimit; val++) {
						if (textArray[val].trim() === '') {
							if (val < textArray.length - 1) currentText += '\n';
						} else {
							currentText += textArray[val];
							currentText += '\n';
							textCount++;
						}
					}
					data.value.data = currentText;
				}
				if (data.value.formats && data.value.formats.list && data.value.formats.list === 'ordered') {
					orderListStarted = true;
					orderListCount += 1;
					data.value.formats.numberedPrefix = `${orderListCount}. `;
				}
				if (data.value.data.includes('\n')) {
					const matchLength = (data.value.data.match(/\n/g) || []).length;
					if (matchLength > 1) {
						orderListStarted = false;
						orderListCount = 0;
					} else if (matchLength === 1 && !orderListStarted) {
						orderListCount = 0;
					} else if (matchLength === 1) {
						orderListStarted = false;
					}
				}
			}
			mobilePostJson = [...mobilePostJson, data];
			if (isCompanyConnectAvailable) {
				if (splitText && splitText.length && !(splitText.length === 1 && splitText[0] === '')) {
					companyConnectWidgetWordCount += splitText.length;
					if (companyConnectWidgetWordCount >= 100) {
						mobilePostJson.push({ ...companyConnectWidget });
						companyConnectWidgetWordCount = 0;
					}
				}
			}
		}
		if (isCompanyConnectAvailable) mobilePostJson.push({ ...companyConnectWidget });
		return mobilePostJson;
	} catch (err) {
		logger.error(`Format MobilePostJson error (story Id = ${storyId})`, err);
		return originalMobilePostJson;
	}
};

// get Company Widget Details
const getCompanyWidgetDetails = async (companyId) => {
	const companyDetails = await companyById(companyId);
	if (companyDetails && companyDetails.id && ['VERIFIED'].includes(companyDetails.status)) {
		let companyCoreTeam = await companyPeopleByCompanyId(companyId);
		const {
			id, name, slug, logo, subtitle, foundingDate,
		} = companyDetails;
		const companyURL = `${SERVICE_PWA}/companies/${slug}`;
		const sectors = await companySectors({ whereObj: { slug } });
		companyCoreTeam = companyCoreTeam.map((person) => _.pick(person.influencerProfile, ['name']));
		return {
			id, name, slug, logo, subtitle, foundingDate, companyURL, companyCoreTeam, sectors,
		};
	}
};

const formatStoryPostContent = (postContent, guestAuthor = false, id = 0, metadata, imgAssets, lazyMedia, storyType, inArticleAdConfig, isCompanyConnectAvailable = false, hasAccessToRead = true) => {
	let parsedPostContent = postContent;
	let iterator = 1;
	let wordCount = 0;
	try {
		parsedPostContent = JSON.parse(postContent);
	} catch (err) {
		parsedPostContent = postContent;
	}
	const $ = cheerio.load(parsedPostContent);
	$('.caption-wrapper').each((index, element) => {
		if ($(element).text() === 'image') {
			$(element).text('');
		}
	});
	$('img').each((index, element) => {
		let src = $(element).attr('src');
		if (src) {
			const imgAsset = imgAssets && (imgAssets[src] || imgAssets[src.replace('?fm=png&auto=format', '')]);
			if (src.indexOf('?fm=png&auto=format') < 0) {
				src = `${src}?fm=png&auto=format`;
			}
			if (imgAsset && imgAsset.width > 800) {
				src = `${src}&w=800`;
			}
			if (lazyMedia) {
				$(element).attr('src', `${src}&blur=500`);
				$(element).attr('data-src', src);
				$(element).addClass('lazyimg');
			}
		}
	});
	let jwplayerEmbedsCount = 0;
	$('iframe').each(function () {
		const src = $(this).attr('src');
		if (!src || src === 'about:blank') {
			$(this).replaceWith('');
		} else {
			const jwplayerEmbedRegex = /(https:\/\/cdn.jwplayer.com\/players\/)((.{8})-(.{8}))(.html)/;
			const jwplayerEmbedFound = src.match(jwplayerEmbedRegex);
			if (jwplayerEmbedFound) {
				jwplayerEmbedsCount++;
				$(this).attr('src', `${process.env.SERVICE_API}/api/v2/embed/video?mediaId=${jwplayerEmbedFound[3]}&playerId=${jwplayerEmbedFound[4]}&autoplay=${jwplayerEmbedsCount === 1}`);
			}
		}
	});
	if (isCompanyConnectAvailable && hasAccessToRead) {
		$('body').append(`<div class="company-connect-${id}"></div>`);
	}
	if (metadata.editors && metadata.editors.length) {
		let editors = '';
		if (metadata.editors.length > 1) {
			metadata.editors.forEach((editor, index) => {
				if (index === metadata.editors.length - 1) {
					editors = editors.concat(`and ${editor.name}`);
				} else editors = editors.concat(`${editor.name}${metadata.editors.length - 2 === index ? ' ' : ', '}`);
			});
		} else {
			editors = metadata.editors[0].name;
		}
		if (hasAccessToRead) {
			const editedBy = `<div class="editors"><hr class="dotted"><p>Edited by ${editors}</p></div>`;
			$('body').append(editedBy);
		}
	}
	if (guestAuthor === true) {
		const disclaimer = '<p><em>(Disclaimer: The views and opinions expressed in this article are those of the author and do not necessarily reflect the views of YourStory.)</em></p>';
		$('body').append(disclaimer);
	}
	const removeAds = metadata ? metadata.removeAds : false;
	const brandSpotlight = metadata && (metadata.removeAds || metadata.sponsoredStory || (metadata.brandSpotlight && metadata.brandSpotlight.name));
	const insertAds = !brandSpotlight && !removeAds && !metadata.sponsored;
	try {
		if (isCompanyConnectAvailable) {
			let companyConnectWidgetWordCount = 0;
			let widgetCount = 0;
			$('.quill-content').children().each(function () {
				const splitBlock = $(this).text().split(' ');
				if (splitBlock && splitBlock.length && !(splitBlock.length === 1 && splitBlock[0] === '')) {
					companyConnectWidgetWordCount += splitBlock.length;
					if (companyConnectWidgetWordCount >= 100) {
						$(this).after(`<div class="company-connect-${id}"></div>`).html();
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
	try {
		if (inArticleAdConfig && insertAds) {
			const first_ad_insert_word_limit = inArticleAdConfig.first_ad_insert_word_limit;
			const ad_insert_word_limit = inArticleAdConfig.ad_insert_word_limit;
			$('.quill-content').children().each(function () {
				const splitBlock = $(this).text().split(' ');
				if (splitBlock && splitBlock.length && !(splitBlock.length === 1 && splitBlock[0] === '')) {
					wordCount += splitBlock.length;
					if (iterator <= 7 && wordCount >= (iterator === 1 ? first_ad_insert_word_limit : ad_insert_word_limit)) {
						if (iterator === 3) {
							const widget_id = `newsletter-${id}`;
							$(this).after(`<div id="${widget_id}"></div>`).html();
						} else {
							const ad_id = `in-article-ad-${iterator}-${id}`;
							$(this).after(`<div class="in-article-ad"><div id=${ad_id}></div></div>`).html();
						}
						iterator += 1;
						wordCount = 0;
					}
				}
			});
		}
	} catch (err) {
		console.log('Error inserting ads.');
	}
	$('div.alsoread').each(function () {
		const alsoReadTitle = $(this).attr('data-title');
		const alsoReadThumbnail = $(this).attr('data-thumbnail');
		const alsoReadPublishedUrl = $(this).attr('data-published-url');
		const alsoReadHTML = `
			<div class="alsoread">
				<div class="alsoread-div">
					<div class="header-text">
						<h3>ALSO READ</h3>
					</div>
					<a href="${alsoReadPublishedUrl}">
						<div class="alsoread-container">
							<div class="alsoread-image">
								<img src="${alsoReadThumbnail}" height="100" width="100" />
							</div>
							<div class="alsoread-content">
								<div class="title">${alsoReadTitle}</div>
							</div>
						</div>
					</a>
				</div>
			</div>
		`;
		$(this).replaceWith(alsoReadHTML);
	});
	trimLineBreaks($);
	return $('body').html();
};

const formatPaywallStoryPostContent = (postContent, paywallLimit) => {
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
	$('.quill-content').children().each(function () {
		if (paraCount < paraLimit) content('.quill-content').append($(this).clone());
		if ($(this)[0].name === 'p' && $(this).html().trim() !== '<br>' && $(this).html().trim() !== 'space') paraCount += 1;
	});

	return content('body').html();
};

const interestsData = async (interestTypes) => {
	const promises = Object.keys(interestTypes).map((type) => {
		if (interestTypes[type].length > 0) {
			switch (type) {
			case 'brand':
				return brandsByIds(interestTypes[type]);
			case 'tag':
				return multipleTagsById(interestTypes[type]);
			case 'category':
				return categoriesByIds(interestTypes[type]);
			case 'author':
				return multipleAuthorMetaById(interestTypes[type]);
			case 'curated_interest':
				return curatedInterestsByIds({ ids: interestTypes[type], active: true, type: 'all' });
			case 'articleTopic':
				return getMultipleListItemsByIds(interestTypes[type]);
			case 'richArticleTopic':
				return getMultipleListItemsByIds(interestTypes[type]);
			default:
				break;
			}
		}
		return [];
	});
	const [brand, tag, category, author, sector, city, curated_interest, articleTopic, richArticleTopic] = await Promise.all(promises);
	return {
		brand,
		tag,
		category,
		author,
		sector,
		city,
		curated_interest,
		articleTopic,
		richArticleTopic,
	};
};

const formatInsightsStories = async (stories) => {
	if (stories && stories.length > 0) {
		const storyIds = stories.map((item) => item.id);

		const [articlesTopics, videosDuration, thumbnails] = await Promise.all([
			storyMetadataByStoryIdAndKey(storyIds, 'articleTopic'),
			storyMetadataByStoryIdAndKey(storyIds, 'videoDuration'),
			storyMetadataByStoryIdAndKey(storyIds, 'thumbnail'),
		]);

		const uniqueArticlesTopics = _.uniqBy(articlesTopics, (topic) => topic.value);
		const uniqueArticlesTopicsName = await Promise.all(uniqueArticlesTopics.map(async (topic) => {
			const topicInfo = await fetchCuratedListItemById(topic.value);
			return { [topic.value]: topicInfo.name };
		}));
		const topicsName = Object.assign({}, ...uniqueArticlesTopicsName);

		const data = stories.map((item, index) => {
			const durationId = _.findIndex(videosDuration, (o) => o.story_id === item.id);
			const thumbnailId = _.findIndex(thumbnails, (o) => o.story_id === item.id);
			const topicData = articlesTopics.filter((topic) => topic.story_id === item.id);

			let publishedUrl;
			if (process.env.APP_ENV !== 'development') {
				publishedUrl = `${process.env.SERVICE_PWA + item.publishedUrl}/amp`;
			} else {
				publishedUrl = `${process.env.SERVICE_API}/api/v2/story/amp?path=${item.publishedUrl}`;
			}

			return {
				id: item.id,
				position: index + 1,
				videoPlatform: item.videoPlatform,
				videoId: item.mediaId,
				title: item.title,
				des: item.subtitle,
				publishedUrl,
				thumbnail: thumbnailId >= 0 && thumbnails[thumbnailId].value,
				videoDuration: durationId >= 0 && secondsToHhmmss(videosDuration[durationId].value),
				timestamp: item.publishedAt,
				topics: topicData.map((topic) => topicsName[topic.value]),
			};
		});
		return data;
	}

	return [];
};

module.exports = {
	formatStory,
	createStoryObject,
	createStoriesArray,
	getCategoryPath,
	getTagPath,
	getAuthorPath,
	getBrandPath,
	interestsData,
	formatInsightsStories,
};
