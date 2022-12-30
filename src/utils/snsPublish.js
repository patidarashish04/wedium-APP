const BASE_URL = process.env.SERVICE_PWA;

const environment = process.env.APP_ENV;
const { SNS, SNS_TOPICS } = require('./AWS/index');

exports.runCopyscape = (storyId) => {
	const TOPIC_ARN = SNS_TOPICS.COPYSCAPE;

	const params = {
		Message: 'Run Copyscape',
		Subject: 'Trigger Copyscape Lambda Function',
		TopicArn: TOPIC_ARN,
		MessageAttributes: {
			storyId: {
				DataType: 'Number',
				StringValue: storyId.toString(),
			},
			environment: {
				DataType: 'String',
				StringValue: environment,
			},
		},
	};

	return new Promise((resolve, reject) => {
		SNS.publish(params, (err) => {
			if (err) {
				console.log('------ERR', err);
				reject(err);
			} else {
				resolve({ success: true, message: 'topic published' });
			}
		});
	});
};

// function checkVideoRequiredParams(videoObject) {
// 	const status = {
// 		deskManagerApprovalValues: ['APPROVE'],
// 		deskManagerRejectionValues: ['REJECT', 'REWORK', 'INREVIEW', 'TRASHED', 'PENDING', 'DRAFTS', 'REPUBLISH', 'SCHEDULED'],
// 		publishedValues: ['PUBLISHED'],
// 		rejectionValues: ['INREVIEW', 'DRAFTS', 'TRASHED', 'SCHEDULED', 'REJECTED', 'NEEDSEDIT', 'REVIEW_FOR_PUBLISHED'],
// 		videoManagerAllValues: ['APPROVED', 'REJECTED', 'PENDING'],
// 		videoManagerApprovalValues: ['APPROVED'],
// 		videoManagerRejectionValues: ['REJECTED', 'PENDING'],
// 	};
// 	// Required params key, slug, brandName='video', status='APPROVED', description(can be null), title, image( can be null), updatedAt
// 	const videoRequiredParams = ['id', 'key', 'slug', 'status', 'title', 'updatedAt'];
// 	let present = true;
// 	if (videoObject) {
// 		videoRequiredParams.forEach((param) => {
// 			if (!videoObject[param]) {
// 				present = false;
// 			}
// 		});
// 	} else {
// 		present = false;
// 	}
// 	return present;
// }

exports.runSES = (topicParams) => {
	const TOPIC_ARN = SNS_TOPICS.SES_EMAIL;

	const params = {
		Message: 'Story Notification',
		Subject: 'Story Notification',
		TopicArn: TOPIC_ARN,
		MessageAttributes: {
			storyTitle: {
				DataType: 'String',
				StringValue: topicParams.storyTitle,
			},
			storyLink: {
				DataType: 'String',
				StringValue: (topicParams.storyLink || BASE_URL),
			},
			authorName: {
				DataType: 'String',
				StringValue: topicParams.authorName,
			},
			email: {
				DataType: 'String',
				StringValue: topicParams.authorEmail,
			},
			userId: {
				DataType: 'String',
				StringValue: topicParams.authorId,
			},
			emailType: {
				DataType: 'String',
				StringValue: topicParams.storyStatus,
			},
			brand: {
				DataType: 'String',
				StringValue: (topicParams.brand || 'yourstory'),
			},
			scheduledTime: {
				DataType: 'String',
				StringValue: (topicParams.scheduledTime || 'none'),
			},
		},
	};

	if (topicParams.storyStatus === 'storyRejected') {
		params.MessageAttributes.comments = {
			DataType: 'String',
			StringValue: topicParams.comments,
		};
		params.MessageAttributes.guidelinesLink = {
			DataType: 'String',
			StringValue: topicParams.guidelinesLink,
		};
	}

	if (topicParams.storyStatus === 'storyRework') {
		params.MessageAttributes.comments = {
			DataType: 'String',
			StringValue: topicParams.comments,
		};
		params.MessageAttributes.editStoryLink = {
			DataType: 'String',
			StringValue: topicParams.editStoryLink,
		};
	}

	if (['storyPublished', 'storyRepublished'].includes(topicParams.storyStatus)) {
		params.MessageAttributes.storyLink = {
			DataType: 'String',
			StringValue: topicParams.storyLink,
		};
	}

	if (['storyInReview', 'scheduledStoryCancelled'].includes(topicParams.storyStatus)) {
		params.MessageAttributes.deskEmail = {
			DataType: 'String',
			StringValue: topicParams.deskEmail,
		};
	}

	return new Promise((resolve, reject) => {
		SNS.publish(params, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve({ success: true, message: 'ses topic published' });
			}
		});
	});
};

exports.triggerNewsSitemap = (brandId) => {
	try {
		const TOPIC_ARN = SNS_TOPICS.NEWS_SITEMAP;

		const params = {
			Message: 'News sitemap trigger',
			Subject: 'News sitemap trigger',
			TopicArn: TOPIC_ARN,
			MessageAttributes: {
				brand: {
					DataType: 'Number',
					StringValue: Number(brandId).toString(),
				},
			},
		};

		return new Promise((resolve) => {
			SNS.publish(params, (err) => {
				if (err) {
					console.log('ERROR: Triggering news sitemap', err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	} catch (err) {
		console.log('ERROR: Unable to trigger sns', err);
		return Promise.resolve(false);
	}
};

exports.notifyAboutComment = (recepientList, storyTitle, storyLink) => {
	try {
		const params = {
			Message: 'New comment notification',
			Subject: 'Lambda Trigger for new comment',
			TopicArn: SNS_TOPICS.SES_EMAIL,
			MessageAttributes: {
				emailType: {
					DataType: 'String',
					StringValue: 'newComment',
				},
				storyTitle: {
					DataType: 'String',
					StringValue: storyTitle,
				},
				storyLink: {
					DataType: 'String',
					StringValue: storyLink,
				},
				recepientList: {
					DataType: 'String.array',
					StringValue: JSON.stringify(recepientList),
				},
			},
		};

		return new Promise((resolve) => {
			SNS.publish(params, (err) => {
				if (err) {
					console.log('ERROR: Triggering comment notification', err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	} catch (err) {
		console.log('ERROR: Triggering comment notification', err);
		return Promise.resolve(false);
	}
};

exports.updateAlgolia = (id, slug, operation) => {
	const TOPIC_ARN = SNS_TOPICS.ALGOLIA_STORY_UPDATE;

	const params = {
		Message: JSON.stringify({ id, slug, operation }),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish updateAlgolia ERROR-----', err, response);
		}
	});
};

exports.syncCompanyAlgolia = ({ companyId, operation }) => {
	const TOPIC_ARN = SNS_TOPICS.ALGOLIA_COMPANY_UPDATE;

	const params = {
		Message: JSON.stringify({ companyId, operation, env: process.env.APP_ENV }),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish syncCompanyAlgolia ERROR-----', err, response);
		}
	});
};

exports.triggerStoryPublishedNotification = (id) => {
	const TOPIC_ARN = SNS_TOPICS.STORY_PUBLISHED_NOTIFICATION;

	const params = {
		Message: JSON.stringify({ storyId: id, env: process.env.APP_ENV }),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish triggerStoryPublishedNotification ERROR-----', err, response);
		}
	});
};

exports.updateFCMTopicSubscription = ({
	topic, type, fcmToken, userId,
}) => {
	const TOPIC_ARN = SNS_TOPICS.UPDATE_FCM_TOPIC_SUBSCRIPTION;

	const params = {
		Message: JSON.stringify({
			topic, type, fcmToken, userId, env: process.env.APP_ENV,
		}),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish updateFCMTopicSubscription ERROR-----', err, response);
		}
	});
};

exports.sendStoryFCMNotification = ({ notification, data, tokens }) => {
	const TOPIC_ARN = SNS_TOPICS.SEND_STORY_FCM_NOTIFICATION;

	const params = {
		Message: JSON.stringify({
			notification, data, tokens, env: process.env.APP_ENV,
		}),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish sendStoryFCMNotification ERROR-----', err, response);
		}
	});
};

exports.triggerWebinarEventFCMNotification = ({ webinarId, eventType }) => {
	const TOPIC_ARN = SNS_TOPICS.TRIGGER_WEBINAR_EVENT_FCM_NOTIFICATION;

	const params = {
		Message: JSON.stringify({ webinarId, eventType, env: process.env.APP_ENV }),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish triggerWebinarEventFCMNotification ERROR-----', err, response);
		}
	});
};

exports.sendWebinarEventFCMNotification = ({ notification, data, tokens }) => {
	const TOPIC_ARN = SNS_TOPICS.SEND_WEBINAR_EVENT_FCM_NOTIFICATION;

	const params = {
		Message: JSON.stringify({
			notification, data, tokens, env: process.env.APP_ENV,
		}),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish sendWebinarEventFCMNotification ERROR-----', err, response);
		}
	});
};

exports.sendOrganizationMaintainerInvite = (email, orgId, orgName, inviteCode) => new Promise((resolve) => {
	if (!(email && inviteCode && orgName)) {
		return resolve(false);
	}
	const TOPIC_ARN = SNS_TOPICS.SES_EMAIL;

	const params = {
		Message: 'Email Verification',
		Subject: 'Lambda Trigger',
		TopicArn: TOPIC_ARN,
		MessageAttributes: {
			email: {
				DataType: 'String',
				StringValue: email,
			},
			inviteCode: {
				DataType: 'String',
				StringValue: inviteCode,
			},
			orgName: {
				DataType: 'String',
				StringValue: orgName,
			},
			orgId: {
				DataType: 'String',
				StringValue: orgId,
			},
			emailType: {
				DataType: 'String',
				StringValue: 'inviteOrganizationMaintainer',
			},
			environment: {
				DataType: 'String',
				StringValue: process.env.APP_ENV || 'development',
			},
		},
	};

	SNS.publish(params, (err) => {
		if (err) {
			console.log('\n\nError in sns.publish invoke\n\n', err);
			return resolve(false);
		}
		return resolve('published to topic');
	});
});

exports.netcoreUpdate = (sub, unsub) => new Promise((resolve, reject) => {
	const TOPIC_ARN = SNS_TOPICS.NETCORE_SUBSCRIBE;
	const params = {
		Message: JSON.stringify({ sub, unsub, env: process.env.APP_ENV }),
		TopicArn: TOPIC_ARN,
	};
	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('Netcore list update failed', err, response);
			reject('Netcore list update failed');
		}
		resolve(true);
	});
});

exports.notifyProfileCreated = (data) => {
	try {
		const {
			createdBy, profileName, editorLink, emailType, profileType,
		} = data;
		const params = {
			Message: 'New profile created',
			Subject: 'New profile created',
			TopicArn: SNS_TOPICS.SES_EMAIL,
			MessageAttributes: {
				profileName: {
					DataType: 'String',
					StringValue: profileName,
				},
				createdBy: {
					DataType: 'String',
					StringValue: createdBy,
				},
				editorLink: {
					DataType: 'String',
					StringValue: editorLink,
				},
				environment: {
					DataType: 'String',
					StringValue: process.env.APP_ENV,
				},
				emailType: {
					DataType: 'String',
					StringValue: emailType,
				},
				profileType: {
					DataType: 'String',
					StringValue: profileType,
				},
			},
		};

		return new Promise((resolve) => {
			SNS.publish(params, (err) => {
				if (err) {
					console.log('Error triggering new profile created email', err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	} catch (err) {
		console.log('Error triggering new profile created email', err);
		return Promise.resolve(false);
	}
};

exports.profileClaimsSES = async (data) => {
	try {
		const TOPIC_ARN = SNS_TOPICS.PROFILE_CLAIMS_SES;
		const params = {
			Message: 'Profile Claims SES',
			Subject: 'Profile Claims SES',
			TopicArn: TOPIC_ARN,
			MessageAttributes: data,
		};

		return await SNS.publish(params, (err) => {
			if (err) {
				console.log('profile claims ses error', err);
			} else {
				return { success: true, message: 'profile claims sns topic published' };
			}
		});
	} catch (err) {
		console.log('profile claims ses error', err);
	}
};

exports.webinarNotifications = async (data) => {
	try {
		const TOPIC_ARN = SNS_TOPICS.WEBINAR_NOTIFICATIONS;
		const params = {
			Message: 'Webinar SES',
			Subject: 'Webinar SES',
			TopicArn: TOPIC_ARN,
			MessageAttributes: data,
		};
		return await SNS.publish(params, (err) => {
			if (err) {
				console.log('webinar ses error', err);
			} else {
				return { success: true, message: 'webinar sns topic published' };
			}
		});
	} catch (err) {
		console.log('webinar notifications error', err);
	}
};

exports.roleChangeSNSTrigger = (email, userId, emailType, forUser, byUser, recepientList) => {
	if (!((environment === 'production') || (environment === 'prod'))) {
		return Promise.resolve('Not required');
	}

	if (!(email && userId && emailType && forUser && byUser && recepientList)) {
		console.log('\n\nError in roleChangeSNSTrigger, email or verificationCode or userId undefined\n\n', email, userId, emailType, forUser, byUser, recepientList);
		return Promise.resolve(false);
	}

	return new Promise((resolve) => {
		const params = {
			Message: 'Change of role',
			Subject: 'Lambda Trigger for Role Change',
			TopicArn: SNS_TOPICS.SES_EMAIL,
			MessageAttributes: {
				email: {
					DataType: 'String',
					StringValue: email,
				},
				userId: {
					DataType: 'String',
					StringValue: userId,
				},
				emailType: {
					DataType: 'String',
					StringValue: 'roleChange',
				},
				forUser: {
					DataType: 'String',
					StringValue: JSON.stringify(forUser),
				},
				byUser: {
					DataType: 'String',
					StringValue: JSON.stringify(byUser),
				},
				recepientList: {
					DataType: 'String.array',
					StringValue: JSON.stringify(recepientList),
				},
			},
		};

		SNS.publish(params, (err) => {
			if (err) {
				console.log('\n\nError in sns.publish invoke\n\n', err);
				return resolve(false);
			}
			return resolve('published to topic');
		});
	});
};

module.exports.snsPublishSignUpInvite = async (email, inviteCode, userId, emailType) => {
	if (!(email && inviteCode && userId)) {
		console.log('\n\nError in sns topic publish for signup invite, email or inviteCode or userId undefined\n\n');
		return false;
	}

	const params = {
		Message: 'Signup Invitation',
		Subject: 'Lambda Trigger for signup invitation',
		TopicArn: SNS_TOPICS.SES_EMAIL,
		MessageAttributes: {
			emailAddress: {
				DataType: 'String',
				StringValue: email,
			},
			inviteCode: {
				DataType: 'String',
				StringValue: inviteCode,
			},
			userId: {
				DataType: 'String',
				StringValue: userId,
			},
			emailType: {
				DataType: 'String',
				StringValue: emailType,
			},
			environment: {
				DataType: 'String',
				StringValue: environment,
			},
		},
	};

	return new Promise((resolve) => {
		SNS.publish(params, (err) => {
			if (err) {
				console.log('\n\nError in sns.publish invoke\n\n', err);
				return resolve(false);
			}
			return resolve('Published to topic');
		});
	});
};
exports.netcoreLog = (payload) => new Promise((resolve) => {
	if (process.env.APP_ENV === 'development') {
		resolve(true);
		return;
	}
	const TOPIC_ARN = SNS_TOPICS.NETCORE_LOGGING;
	const params = {
		Message: JSON.stringify({ data: payload }),
		TopicArn: TOPIC_ARN,
	};
	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('Netcore contact update failed', err, response);
		}
		resolve(true);
	});
});

exports.companyConnectEmail = (data) => {
	try {
		let params;
		switch (data.emailType) {
		case 'companyConnectEmail': {
			const {
				founderEmail, reachOutEmail, addressee, reachOutName, linkedInUrl, subject, message, emailType, devData,
			} = data;
			params = {
				Message: 'Company connect email',
				Subject: 'Company connect email trigger',
				TopicArn: SNS_TOPICS.SES_EMAIL,
				MessageAttributes: {
					emailType: {
						DataType: 'String',
						StringValue: emailType,
					},
					founderEmail: {
						DataType: 'String',
						StringValue: founderEmail,
					},
					reachOutEmail: {
						DataType: 'String',
						StringValue: reachOutEmail,
					},
					addressee: {
						DataType: 'String',
						StringValue: addressee,
					},
					reachOutName: {
						DataType: 'String',
						StringValue: reachOutName,
					},
					linkedInUrl: {
						DataType: 'String',
						StringValue: linkedInUrl,
					},
					subject: {
						DataType: 'String',
						StringValue: subject,
					},
					message: {
						DataType: 'String',
						StringValue: message,
					},
					environment: {
						DataType: 'String',
						StringValue: environment,
					},
					devData: {
						DataType: 'String',
						StringValue: devData,
					},
				},
			};

			break; }
		case 'companyConnectRejectEmail': {
			const {
				emailType,
				reachOutName,
				companyName,
				companyLink,
				userEmail,
				connectReason,
				comment,
			} = data;

			params = {
				Message: 'Company connect rejection email',
				Subject: 'Company connect rejection email trigger',
				TopicArn: SNS_TOPICS.SES_EMAIL,
				MessageAttributes: {
					emailType: {
						DataType: 'String',
						StringValue: emailType,
					},
					reachOutName: {
						DataType: 'String',
						StringValue: reachOutName,
					},
					companyName: {
						DataType: 'String',
						StringValue: companyName,
					},
					companyLink: {
						DataType: 'String',
						StringValue: companyLink,
					},
					userEmail: {
						DataType: 'String',
						StringValue: userEmail,
					},
					connectReason: {
						DataType: 'String',
						StringValue: connectReason,
					},
					comment: {
						DataType: 'String',
						StringValue: comment,
					},
				},
			};
			break; }
		default:
			break;
		}

		return new Promise((resolve) => {
			SNS.publish(params, (err) => {
				if (err) {
					console.log('Error triggering new profile created email', err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	} catch (err) {
		console.log('Error triggering new profile created email', err);
		return Promise.resolve(false);
	}
};

exports.techSparksWelcomeEmail = (data) => {
	try {
		const {
			firstName, emailType, emailId,
		} = data;
		const params = {
			Message: 'Techsparks signup email',
			Subject: 'Techsparks signup email trigger',
			TopicArn: SNS_TOPICS.SES_EMAIL,
			MessageAttributes: {
				emailType: {
					DataType: 'String',
					StringValue: emailType,
				},
				firstName: {
					DataType: 'String',
					StringValue: firstName,
				},
				emailId: {
					DataType: 'String',
					StringValue: emailId,
				},
				environment: {
					DataType: 'String',
					StringValue: environment,
				},
			},
		};

		return new Promise((resolve) => {
			SNS.publish(params, (err) => {
				if (err) {
					console.log('Error triggering techsparks sign up email', err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	} catch (err) {
		console.log('Error triggering techsparks sign up email', err);
		return Promise.resolve(false);
	}
};

exports.emailPaymentUrl = (data) => {
	try {
		const {
			url, emailType, emailId,
		} = data;
		const params = {
			Message: 'Payment Failure',
			Subject: 'Payment Failure trigger',
			TopicArn: SNS_TOPICS.SES_EMAIL,
			MessageAttributes: {
				emailType: {
					DataType: 'String',
					StringValue: emailType,
				},
				url: {
					DataType: 'String',
					StringValue: url,
				},
				emailId: {
					DataType: 'String',
					StringValue: emailId,
				},
				environment: {
					DataType: 'String',
					StringValue: environment,
				},
			},
		};

		return new Promise((resolve) => {
			SNS.publish(params, (err) => {
				if (err) {
					console.log('Error triggering email with payment url', err);
					return resolve(false);
				}
				return resolve(true);
			});
		});
	} catch (err) {
		console.log('Error triggering email with payment url', err);
		return Promise.resolve(false);
	}
};

exports.updateResumeParser = (messageData) => {
	const TOPIC_ARN = SNS_TOPICS.RESUME_PARSER_UPDATE;

	const params = {
		Message: JSON.stringify(messageData),
		TopicArn: TOPIC_ARN,
	};

	SNS.publish(params, (err, response) => {
		if (err) {
			console.log('------sns_publish updateResumeParser ERROR-----', err, response);
		}
	});
};
