import logger from './logger';

const htmlToArticleJson = require('html-to-article-json')();
const convertToFbia = require('article-json-to-fbia');
const parser = require('../parser/index');

const BASE_URL = process.env.SERVICE_PWA;

const fbPixelScript = `
	<figure class="op-tracker"> 
        <iframe>
            <script>
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','//connect.facebook.net/en_US/fbevents.js');
                fbq('init', '536691223168677');
                fbq('track', "PageView");
            </script>
        </iframe>
	</figure>
`;
const ysPixelScript = `
	<!-- YourStory Analytics Pixel -->
		<figure class="op-tracker">
			<iframe hidden>
				<noscript><img height="1" width="1" style="display:none" src="${BASE_URL}/api/v2/analytics?i=_content_id_&t=_content_type_&u=_content_url_&pt=c&ev=pv&b=_content_brand_" /></noscript>
			</iframe>
		</figure>
	<!-- End of YourStory Analytics Pixel -->
`;
const quoraPixelScript = `
	<figure class="op-tracker">
		<iframe hidden>
			<!-- DO NOT MODIFY -->
			<!-- Quora Pixel Code (JS Helper) -->
			<script>
			!function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');
			qp('init', '1039fe9bc20049639b60aba9059c159a');
			qp('track', 'ViewContent');
			</script>
			<noscript><img height="1" width="1" style="display:none" src="https://q.quora.com/_/ad/1039fe9bc20049639b60aba9059c159a/pixel?tag=ViewContent&noscript=1"/></noscript>
			<!-- End of Quora Pixel Code -->
		</iframe>
	</figure>
`;
const comscoreScript = `
	<figure class="op-tracker"> 
		<iframe>
			<!-- Begin comScore Tag -->
			<script>
				var _comscore = _comscore || [ ];
				_comscore.push({ c1: "2", c2: "18173739",
					options: {
						url_append: "comscorekw=fbia"
					}
				});

				(function() {
					var s = document.createElement("script"), el =
					document.getElementsByTagName("script")[0]; s.async = true;
					s.src = (document.location.protocol == "https:" ? "https://sb" : "http://b") +
					".scorecardresearch.com/beacon.js";
					el.parentNode.insertBefore(s, el);
				})();
			</script>
			<noscript>
				<img
				src="http://b.scorecardresearch.com/p?c1=2&c2=18173739&cv=2.0&cj=1&comscorekw=fbia" />
			</noscript>
			<!-- End comScore Tag -->
		</iframe>
	</figure>
`;
const gaScript = `
	<figure class="op-tracker"> 
		<iframe hidden>
			<script>
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
				ga('create', 'UA-18111131-5', 'auto');
				ga('require', 'displayfeatures');
				ga('set', 'campaignSource', 'Facebook');
				ga('set', 'campaignMedium', 'Social Instant Article');
				ga('set', 'title', 'story-title'); 
				ga('send', 'pageview');
			</script>
		</iframe>
	</figure>
`;
const dfpScript = `
	<figure class="op-ad">
		<iframe height="250" width="300">
			<script async='async' src='https://www.googletagservices.com/tag/js/gpt.js'></script>
			<script>
				var googletag = googletag || {};
				googletag.cmd = googletag.cmd || [];
			</script>
			<script>
				googletag.cmd.push(function() {
				googletag.defineSlot('ad-unit-id', [300, 250], 'ad-unit-id').addService(googletag.pubads()).setTargeting("category","targeting-name");
				googletag.enableServices();
				});
			</script>
			<!-- ad-unit-id -->
			<div id='ad-unit-id'>
				<script>
				googletag.cmd.push(function() { googletag.display('ad-unit-id'); });
				</script>
			</div>
		</iframe>
	</figure>
`;
const articleCTA = `
	<figure class="op-ad">
		<iframe>
			<script async='async' src='https://www.googletagservices.com/tag/js/gpt.js'></script>
			<script>
				var googletag = googletag || {};
				googletag.cmd = googletag.cmd || [];
			</script>
			<script>
				googletag.cmd.push(function() {
				googletag.defineSlot('/154555149/art_cta', ['fluid'], 'div-gpt-ad-1523900863579-0').addService(googletag.pubads());
				googletag.pubads().enableSingleRequest(); googletag.pubads().collapseEmptyDivs(); googletag.enableServices();
				});
			</script>
			<!-- /154555149/art_cta -->
			<div id='div-gpt-ad-1523900863579-0'>
				<script>
				googletag.cmd.push(function() { googletag.display('div-gpt-ad-1523900863579-0'); });
				</script>
			</div>
		</iframe>
	</figure>
`;

const formatInstantArticle = async (story, metadata, brand) => {
	const brandObject = parser.brand.brandInfo(brand);
	let adTarget = brandObject.slug;
	const metaObject = parser.storyMeta.storyMetaInfo({ storymeta: metadata });
	if (metaObject.authors && metaObject.authors.length > 0) {
		let authorMeta = metaObject.authors.filter((e) => e.order === 0)[0];
		if (authorMeta && authorMeta.id) {
			authorMeta = parser.authorMeta.authorMetaInfo(authorMeta, 'minimal');
		}
		metaObject.author = authorMeta;
	} else {
		metaObject.author = {};
	}
	delete metaObject.authors;
	if (metaObject.brandSpotlight) {
		metaObject.brandSpotlight = parser.brandSpotlight.brandSpotlightInfo(metaObject.brandSpotlight, 'minimal');
	}
	if (metaObject.category) {
		metaObject.category = parser.category.categoryInfo(metaObject.category, 'minimal');
		adTarget = metaObject.category.slug;
	}
	const storyObject = parser.story.storyInfo(story);
	const instantArticleMarkup = await fbiaTransform(storyObject, metaObject, brandObject, adTarget);
	const instantArticle = {
		title: storyObject.title,
		id: metaObject.canonicalUrl,
		link: metaObject.canonicalUrl,
		description: metaObject.generic.excerpt,
		content: instantArticleMarkup,
		date: new Date(storyObject.publishedAt),
		author: [{
			name: metaObject && metaObject.author && metaObject.author.name ? metaObject.author.name : '',
			email: ' ',
		}],
	};
	return instantArticle;
};

const getAds = (target) => {
	const dfpAds = [];
	const adScripts = ['YS_EN_NM_ART_IA_RE_1', 'YS_EN_NM_ART_IA_RE_2', 'YS_EN_NM_ART_IA_RE_3', 'YS_EN_NM_ART_IA_RE_4', 'YS_EN_NM_ART_IA_RE_5', 'YS_EN_NM_ART_IA_RE_6'];
	let dfpString = ' <section class="op-ad-template">';
	adScripts.forEach((ad) => {
		const adUnitId = `/154555149/${ad}`;
		let adScript = dfpScript.split('ad-unit-id').join(adUnitId);
		adScript = adScript.replace(/targeting-name/g, target);
		dfpAds.push(adScript);
		dfpString += adScript;
		if (adScripts.indexOf(ad) === 0) {
			dfpString = dfpString.replace('op-ad"', 'op-ad op-ad-default"');
		}
	});
	dfpString += '</section>';
	return {
		dfpAds,
		dfpString,
	};
};

const fbiaTransform = async (story, metaData, brandData, adTarget) => {
	try {
		const adsData = getAds(adTarget);
		const articleJson = htmlToArticleJson(story.postContent);
		const defaultAds = true;
		const headerString = `
			<header>
				<figure><img src="${(metaData.generic.media || metaData.thumbnail)}"/></figure>
				<h1>${story.title}</h1>
				<time class="op-published" datetime="${new Date(story.publishedAt)}">${new Date(story.publishedAt)}</time>
				<address>${metaData.author.name}</address>
				<h3 class="op-kicker">${(metaData.category && metaData.category.name ? metaData.category.name : brandData.name)}</h3>
				${adsData.dfpString.replace(/targeting-name/g, metaData.category && metaData.category.name ? metaData.category.name : brandData.name)}
			</header>
		`;
		for (let j = 0; j < articleJson.length; j++) {
			const elements = articleJson[j].children || [articleJson[j]];
			elements.forEach((item) => {
				if (item.type === 'embed' && item.embedType !== 'image') {
					articleJson[j] = item;
				}
			});
		}
		let fbia = convertToFbia(articleJson);
		const gaScriptString = gaScript.replace('story-title', story.title);
		const ysPixelScriptString = ysPixelScript.replace('_content_id_', story.id).replace('_content_url_', metaData.storyUrl).replace('_content_brand_', brandData.id).replace('_content_type_', 'ia');
		fbia = [fbia.slice(0, 9), headerString + gaScriptString + fbPixelScript + ysPixelScriptString + comscoreScript + quoraPixelScript, fbia.slice(9)].join('');
		fbia = [fbia.slice(0, fbia.length - 10), articleCTA, fbia.slice(fbia.length - 10)].join('');
		fbia = `<!doctype html><html><head><link rel="canonical" href="${metaData.canonicalUrl}"/><meta charset="utf-8"/><meta property="fb:article_style" content="default"/><meta property="fb:use_automatic_ad_placement" content="${defaultAds}"/></head><body>${fbia}</body></html>`;
		return fbia;
	} catch (e) {
		logger.error(`FBIA transform error (storyId = ${story.id}, storySlug = ${story.slug})`, e);
		return null;
	}
};

module.exports = {
	formatInstantArticle,
};
