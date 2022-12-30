const ADVERTISEMENT_INBOUND = 'arn:aws:sns:ap-southeast-1:049506478708:advertisement-inbound';
const CHARTBOT_HUMAN_HANDOFF = 'arn:aws:sns:ap-southeast-1:049506478708:chatbot-human-handoff';
const FCM_NEW_REGISTRATION = 'arn:aws:sns:ap-southeast-1:049506478708:fcm-new-registration';
const FCM_TOPIC_SUBSCRIPTION = 'arn:aws:sns:ap-southeast-1:049506478708:fcm-topic-subscription';
const COPYSCAPE = 'arn:aws:sns:ap-southeast-1:049506478708:runCopyscape';
const CMS_SITEMAP = 'arn:aws:sns:ap-southeast-1:049506478708:cmsSitemap';
const SES_EMAIL = 'arn:aws:sns:ap-southeast-1:049506478708:emailInfo';
const NEWS_SITEMAP = 'arn:aws:sns:ap-southeast-1:049506478708:news-sitemap';
const ALGOLIA_STORY_UPDATE = 'arn:aws:sns:ap-southeast-1:049506478708:creatorstudio-algolia-story-update';
const ALGOLIA_COMPANY_UPDATE = 'arn:aws:sns:ap-southeast-1:049506478708:algolia-company-update';
const MAINTAINER_INVITE = SES_EMAIL;
const NETCORE_SUBSCRIBE = 'arn:aws:sns:ap-southeast-1:049506478708:NetcoreUpdateTrigger';
const STORY_PUBLISHED_NOTIFICATION = 'arn:aws:sns:ap-southeast-1:049506478708:story-published-notification';
const UPDATE_FCM_TOPIC_SUBSCRIPTION = 'arn:aws:sns:ap-southeast-1:049506478708:update-fcm-topic-subscription';
const SEND_STORY_FCM_NOTIFICATION = 'arn:aws:sns:ap-southeast-1:049506478708:send-story-fcm-notification';
const TRIGGER_WEBINAR_EVENT_FCM_NOTIFICATION = 'arn:aws:sns:ap-southeast-1:049506478708:trigger-webinar-event-fcm-notification';
const SEND_WEBINAR_EVENT_FCM_NOTIFICATION = 'arn:aws:sns:ap-southeast-1:049506478708:send-webinar-event-fcm-notification';
const PROFILE_CLAIMS_SES = 'arn:aws:sns:ap-southeast-1:049506478708:profile_claims_ses';
const WEBINAR_NOTIFICATIONS = 'arn:aws:sns:ap-southeast-1:049506478708:webinar-ses';
const NETCORE_LOGGING = 'arn:aws:sns:ap-southeast-1:049506478708:netcore-upsert-contact';
const RESUME_PARSER_UPDATE = 'arn:aws:sns:ap-southeast-1:049506478708:prod-resume-parser-trigger';

export {
	ADVERTISEMENT_INBOUND,
	CHARTBOT_HUMAN_HANDOFF,
	FCM_NEW_REGISTRATION,
	FCM_TOPIC_SUBSCRIPTION,
	COPYSCAPE,
	CMS_SITEMAP,
	SES_EMAIL,
	NEWS_SITEMAP,
	ALGOLIA_STORY_UPDATE,
	ALGOLIA_COMPANY_UPDATE,
	MAINTAINER_INVITE,
	NETCORE_SUBSCRIBE,
	STORY_PUBLISHED_NOTIFICATION,
	UPDATE_FCM_TOPIC_SUBSCRIPTION,
	SEND_STORY_FCM_NOTIFICATION,
	TRIGGER_WEBINAR_EVENT_FCM_NOTIFICATION,
	SEND_WEBINAR_EVENT_FCM_NOTIFICATION,
	PROFILE_CLAIMS_SES,
	WEBINAR_NOTIFICATIONS,
	NETCORE_LOGGING,
	RESUME_PARSER_UPDATE,
};
