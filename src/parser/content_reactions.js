// curatedSet info
const contentReactionInfo = (contentReaction, format) => {
	if (format === 'story') {
		return ({
			storyId: contentReaction.content_id,
			commentCount: contentReaction.comment_count,
			likeCount: contentReaction.like_count,
		});
	} if (format === 'minimal') {
		return ({
			contentId: contentReaction.content_id,
			commentCount: contentReaction.comment_count,
			likeCount: contentReaction.like_count,
			dislikeCount: contentReaction.dislike_count,
			shareCount: contentReaction.shareCount,
		});
	}
	return ({
		contentId: contentReaction.content_id,
		commentCount: contentReaction.comment_count,
		likeCount: contentReaction.like_count,
		dislikeCount: contentReaction.dislike_count,
		fbShareCount: contentReaction.fb_share_count,
		twitterShareCount: contentReaction.twitter_share_count,
		linkedinShareCount: contentReaction.linkedin_share_count,
		shareCount: contentReaction.shareCount,
	});
};

module.exports = {
	contentReactionInfo,
};
