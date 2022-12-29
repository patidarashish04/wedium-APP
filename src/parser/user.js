const userInfo = (user, format) => {
	if (format === 'minimal') {
		return {
			name: user.name,
			username: user.username,
			primaryEmail: user.primary_email,
		};
	}
	return {
		name: user.name,
		username: user.username,
		primaryEmail: user.primary_email,
		roles: user.roles,
		employee: user.employee,
		verifiedEmail: user.verified_email,
		bounced: user.bounced,
		profileImage: user.profile_image,
	};
};

export {
	userInfo,
};
