// eslint-disable-next-line no-unused-vars
// const BASE_URL = process.env.SERVICE_CREATORSTUDIO;
import logger from './logger';

const YOURSTORY_URL = process.env.SERVICE_PWA;
const { addActivityStream } = require('../services/ActivityStream/functions');

// (untested)
const addToActivityStream = async (eventName, brand, actor, target) => {
	let body;
	try {
		let eventHtml;
		// <a href=${`${BASE_URL}/editor/${brand}/${target.id}`}>
		switch (eventName) {
		case 'UPDATED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> updated 😳 the story with title - <b>${target.title}</b></p>`;
			break;
		case 'SENT_TO_REVIEW':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> submitted 😍 the story with title - <b>${target.title}</b> for review</p>`;
			break;
		case 'REVIEW_FOR_PUBLISHED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> submitted 😍 update on published story with title - <b>${target.title}</b> for review</p>`;
			break;
		case 'PUBLISHED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> published ✅ the story with title - <a href=${`${YOURSTORY_URL}${target.publishedUrl}`}><b>${target.title}</b></a></p>`;
			break;
		case 'SCHEDULED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> scheduled ⏰ the story with title - <b>${target.title}</b></p>`;
			break;
		case 'UNSCHEDULED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> unscheduled 😳 the story with title - <b>${target.title}</b></p>`;
			break;
		case 'REJECTED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> rejected ❌ the story with title - <b>${target.title}</b></p>`;
			break;
		case 'SENT_FOR_REWORK':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> sent the story with title - <b>${target.title}</b> for rework 😱</p>`;
			break;
		case 'TRASHED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> trashed 🚨 the story with title - <b>${target.title}</b></p>`;
			break;
		case 'UNPUBLISHED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> unpublished 😳 the story with title - <b>${target.title}</b></p>`;
			break;
		case 'CHANGED_URL':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> changed the url 🚛 for the story with title - <a href=${`${YOURSTORY_URL}${target.publishedUrl}`}>${target.title}</a></p>`;
			break;
		case 'TAG_CREATED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> created ✅ the tag <b>${target.name}</b>`;
			eventName = 'CREATED';
			break;
		case 'TAG_UPDATED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> updated 😳 the tag <b>${target.name}</b>`;
			eventName = 'UPDATED';
			break;
		case 'TAG_REPLACED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> replaced 🔁 the tag <b><${target.existing.name}</b> with <b>${target.replacement.name}</b></p>`;
			eventName = 'REPLACED';
			break;
		case 'TAG_DELETED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> deleted 🗑 the tag <b>${target.name}</b>`;
			eventName = 'DELETED';
			break;
		case 'CATEGORY_CREATED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> created ✅ the category <b>${target.name}</b>`;
			eventName = 'CREATED';
			break;
		case 'CATEGORY_UPDATED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> updated 😳 the category <b>${target.name}</b>`;
			eventName = 'UPDATED';
			break;
		case 'CATEGORY_REPLACED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> replaced 🔁 the category <b>${target.existing.name}</b> with <b>${target.replacement.name}</b></p>`;
			eventName = 'REPLACED';
			break;
		case 'CATEGORY_DELETED':
			eventHtml = `<p><a href="${YOURSTORY_URL}/author/${actor}">@${actor}</a> deleted 🗑 the category <b>${target.name}</b>`;
			eventName = 'DELETED';
			break;
		default:
			return Promise.resolve();
		}
		body = {
			event_name: eventName,
			event_html: eventHtml,
			brand: brand && brand.id ? brand.id : brand,
			actor,
			target: target.existing ? target.existing.id : target.storyId,
			additional_data: target,
		};
	} catch (e) {
		logger.error(`Error creating activity stream item for event ${eventName}`, e);
	}
	return addActivityStream(body);
};

module.exports = {
	addToActivityStream,
};
