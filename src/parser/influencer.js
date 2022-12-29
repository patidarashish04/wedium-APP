// influencer info
const influencerInfo = (influencer, format) => {
	if (!influencer || !influencer.id) {
		return null;
	}
	const baseObj = {
		id: influencer.id,
		name: influencer.name,
		username: influencer.username,
		subtitle: influencer.subtitle,
		profilePicture: influencer.profilePicture && influencer.profilePicture.url ? ({
			height: influencer.profilePicture.height,
			width: influencer.profilePicture.width,
			url: influencer.profilePicture.url,
		}) : undefined,
		path: `/people/${influencer.username}`,
		socialLinks: influencer.socialLinks,
		website: influencer.website,
	};
	if (format === 'minimal') {
		return baseObj;
	}
	return (Object.assign(baseObj, {
		bio: influencer.bio,
		// email: influencer.email,
		// phoneNumber: influencer.phoneNumber,
		banner: influencer.banner && influencer.banner.url ? ({
			height: influencer.banner.height,
			width: influencer.banner.width,
			url: influencer.banner.url,
		}) : undefined,
	}));
};

const influencerInfoForProfile = (influencer) => {
	if (!influencer || !influencer.id) {
		return null;
	}
	return {
		name: influencer.name,
		image: influencer.profilePicture && influencer.profilePicture.url ? ({
			height: influencer.profilePicture.height,
			width: influencer.profilePicture.width,
			url: influencer.profilePicture.url,
		}) : undefined,
		linkedInUrl: influencer.socialLinks && influencer.socialLinks.linkedin ? influencer.socialLinks.linkedin : null,
	};
};

module.exports = {
	influencerInfo,
	influencerInfoForProfile,
};
