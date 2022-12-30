exports.success = (controller, method, data) => {
	const response = {
		success: true,
		message: `${controller} ${method} successful`,
		data,
	};
	return response;
};

exports.failure = (controller, method, error) => {
	const response = {
		success: false,
		message: `${controller} ${method} unsuccessful`,
		error,
	};
	return response;
};

exports.failureResponse = function failureResponse(
	res,
	statusCode,
	genericMessage,
	specificMessage,
	type,
	values = {},
) {
	return res.status(statusCode).send({
		status: 'fail',
		message: genericMessage,
		error: { type, message: specificMessage, ...values },
	});
};

exports.successResponse = function successResponse(
	res,
	statusCode,
	message,
	value = {},
) {
	const responseObject = value;
	responseObject.status = 'success';
	responseObject.message = message;
	return res.status(statusCode).send(responseObject);
};
