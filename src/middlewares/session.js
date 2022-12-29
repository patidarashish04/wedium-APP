exports.IsAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
	} else {
		return res.sendStatus(403);
	}
};

exports.destroySession = (req, res) => {
	req.logOut();
	req.session.destroy();
	return res.sendStatus(200);
};
