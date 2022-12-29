// authorMeta info
const authorMetaInfo = (authorMeta, format) => {
	if (format === 'minimal') {
		return ({
			name: authorMeta.name,
			username: authorMeta.username,
			order: authorMeta.order,
			imageUrl: authorMeta?.image_url,
		});
	}
	return ({
		id: authorMeta.id,
		user_id: authorMeta.user_id,
		name: authorMeta.name,
		username: authorMeta.username,
		bio: authorMeta.bio ? authorMeta.bio : undefined,
		bioText: authorMeta.bioText ? authorMeta.bioText : undefined,
		imageUrl: authorMeta.image_url ? authorMeta.image_url : null,
		coverImageUrl: authorMeta.coverImageUrl ? authorMeta.coverImageUrl : undefined,
		order: authorMeta.order,
		visibility: authorMeta.visibility,
		google: authorMeta.google_url ? authorMeta.google_url : null,
		facebook: authorMeta.facebook_url ? authorMeta.facebook_url : null,
		twitter: authorMeta.twitter_url ? authorMeta.twitter_url : null,
		linkedin: authorMeta.linkedin_url ? authorMeta.linkedin_url : null,
		website: authorMeta.website_url ? authorMeta.website_url : null,
		publishedStories: authorMeta?.publishedStories,
		updatedAt: authorMeta.updatedAt ? authorMeta.updatedAt : null,
		location: authorMeta.location ? authorMeta.location : null,
		designation: authorMeta.designation ? authorMeta.designation : null,
		categories: authorMeta.categories ? authorMeta.categories : null,
	});
};

const authorsMetaInfo = (authorMeta) => ({
	id: authorMeta.id,
	user_id: authorMeta.user_id,
	name: authorMeta.name,
	username: authorMeta.username,
	imageUrl: authorMeta.image_url ? authorMeta.image_url : null,
	coverImageUrl: authorMeta.coverImageUrl ? authorMeta.coverImageUrl : undefined,
	visibility: authorMeta.visibility,
	publishedStories: authorMeta?.publishedStories,
	location: authorMeta.location ? authorMeta.location : undefined,
	designation: authorMeta.designation ? authorMeta.designation : undefined,
});

module.exports = {
	authorMetaInfo,
	authorsMetaInfo,
};
