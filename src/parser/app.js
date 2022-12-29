// user info app
const userInfoAppV2 = (user) => ({
	display_name: user.name,
	user_nicename: user.username,
});

module.exports = {
	userInfoAppV2,
};
