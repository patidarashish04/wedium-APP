const envConfig = global.config;

export const companyEditFormFields = {
	sections: {
		introduction: {
			image: 'mandatory',
			smallDescription: 'mandatory',
			sectors: 'mandatory',
			websiteLink: 'optional',
			appLinkIOS: 'optional',
			appLinkAndroid: 'optional',
			linkedInLink: 'optional',
			twitterLink: 'optional',
			facebookLink: 'optional',
			wikipediaLink: 'optional',
		},
		basicInformation: {
			description: 'optional',
			legalName: 'optional',
			officeLocations: {
				requirement: 'optional',
				fields: {
					city: 'mandatory',
					employeesCount: 'optional',
					googleMapLink: 'optional',
					headquarter: 'optional',
				},
			},
			businessModels: 'mandatory',
			foundingDate: 'mandatory',
			numberOfEmployees: 'optional',
			coreTeam: {
				requirement: 'mandatory',
				fields: {
					name: 'mandatory',
					position: 'mandatory',
					linkedInUrl: 'optional',
				},
			},
		},
		timeline: {
			requirement: 'optional',
			fields: {
				category: 'mandatory',
				date: 'mandatory',
				description: 'optional',
				url: 'optional',
			},
		},
		revenueStreams: 'mandatory',
		targetMarket: {
			b2b: {
				requirement: 'optional',
				fields: {
					description: 'mandatory',
					clientSegments: 'mandatory',
					targetCompanies: 'mandatory',
					targetGeographies: 'mandatory',
				},
			},
			b2c: {
				requirement: 'optional',
				fields: {
					description: 'mandatory',
					userAgeGroups: 'mandatory',
					userIncomeRanges: 'mandatory',
					targetGeographies: 'mandatory',
				},
			},
		},
		funding: {
			type: 'mandatory',
			totalFunding: 'optional',
			leadInvestors: {
				requirement: 'optional',
				fields: {
					name: 'mandatory',
					linkedInUrl: 'optional',
				},
			},
			rounds: {
				requirement: 'optional',
				fields: {
					name: 'mandatory',
					fundingAmount: 'optional',
					date: 'mandatory',
				},
			},
		},
		products: {
			requirement: 'optional',
			fields: {
				name: 'mandatory',
				logo: 'mandatory',
				type: 'mandatory',
				description: 'mandatory',
				website: 'mandatory',
				sector: 'mandatory',
				offers: {
					requirement: 'optional',
					fields: {
						description: 'mandatory',
						ctaText: 'optional',
						ctaLink: 'optional',
					},
				},
			},
		},
	},
};

export const sectionTitles = {
	basicInformation: 'Basic Information',
	timeline: 'Timeline',
	revenueStreams: 'Revenue Streams',
	targetMarket: 'Target Market',
	funding: 'Funding',
	products: 'Products and Services',
};

export const webinarLive = {
	id: '946e739a-b2d2-11ea-b3de-0242ac130004',
	slug: 'live-webinars',
	title: 'Live Sessions',
	subtitle: 'Webinar • Startups • Inspiration • Learning',
	description: 'Checkout all our live sessions here. If you feel it could add value, do share it within your network.',
	// banner: {
	//     landscape: {
	//         height: 544,
	//         width: 1088,
	//         url: "https://images.yourstory.com/assets/images/banners/webinars_upcoming.jpeg"
	//     }
	// },
	icon: {
		height: 544,
		width: 544,
		url: 'https://images.yourstory.com/assets/images/banners/ystviconcommon+.jpg',
	},
	path: '/webinars/live',
};

export const webinarUpcoming = {
	id: '946e75b6-b2d2-11ea-b3de-0242ac130004',
	slug: 'upcoming-webinars',
	title: 'Live & Upcoming Sessions',
	subtitle: 'Checkout our live & upcoming sessions',
	description: 'Checkout all our upcoming sessions here. If you feel it could add value, do share it within your network.',
	banner: {
		landscape: {
			height: 544,
			width: 1088,
			url: 'https://images.yourstory.com/cs/2/5cd74df08d8d11e9a445857ac4ecdc72/LiveUpcomingWebinars-1593392988212.jpg',
		},
	},
	icon: {
		height: 544,
		width: 544,
		url: 'https://images.yourstory.com/assets/images/banners/ystviconcommon+.jpg',
	},
	path: '/webinars/upcoming',
};

export const webinarPrevious = {
	id: '946e76a6-b2d2-11ea-b3de-0242ac130004',
	slug: 'previous-webinars',
	title: 'Previous Sessions',
	subtitle: 'All our older sessions archived for you',
	description: "All our previously conducted sessions, archived for you in one single page. From startup advice to innovative product stories, we've covered everything!",
	banner: {
		landscape: {
			height: 544,
			width: 1088,
			url: 'https://images.yourstory.com/assets/images/banners/webinars_previous.jpeg',
		},
	},
	icon: {
		height: 544,
		width: 544,
		url: 'https://images.yourstory.com/assets/images/banners/ystviconcommon+.jpg',
	},
	path: '/webinars/previous',
};

export const serviceAccount = {
	type: 'service_account',
	project_id: 'the-captable',
	private_key_id: envConfig.firebase.private_key_id,
	private_key: envConfig.firebase.private_key.replace(/\\n/g, '\n'),
	client_email: 'firebase-adminsdk-8x357@the-captable.iam.gserviceaccount.com',
	client_id: envConfig.firebase.client_id,
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8x357%40the-captable.iam.gserviceaccount.com',
};

export const serviceAccountDev = {
	type: 'service_account',
	project_id: 'captable-dev-af23d',
	private_key_id: envConfig.firebase.private_key_id,
	private_key: envConfig.firebase.private_key.replace(/\\n/g, '\n'),
	client_email: 'firebase-adminsdk-dxd8b@captable-dev-af23d.iam.gserviceaccount.com',
	client_id: envConfig.firebase.client_id,
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dxd8b%40captable-dev-af23d.iam.gserviceaccount.com',
};

export const netcoreConfig = {
	apiUrl: 'https://api2.netcoresmartech.com/v1/activity/upload',
	token: '08626c29571651737bf3ded3fa86c8b0',
};

export const brandsData = {
	yourstory: {
		newsletterText: 'Get stories of change makers and innovators from the startup ecosystem in your inbox',
		themeColor: '#f23f2d',
	},
	weekender: {
		newsletterText: 'Explore the other side of an entrepreneur in our weekly #YSWeekender Column',
		themeColor: '#ef4136',
	},
	mystory: {
		newsletterText: 'A weekly digest of top articles picked up by the community manager, from resources to technology',
		themeColor: '#ef4136',
	},
	smbstory: {
		newsletterText: 'Meet a new Hero every week - Get inspiring stories of entrepreneurs building Indian brands',
		themeColor: '#ef4136',
	},
	socialstory: {
		newsletterText: 'Get news and updates from the world of social entrepreneurship',
		themeColor: '#0d8f72',
	},
	herstory: {
		newsletterText: 'Get inspired by reading stories of women disrupting the startup ecosystem',
		themeColor: '#6354a3',
	},
	'enterprise-story': {
		newsletterText: 'Stay On Top Of The Latest Innovations In The Digitization Of India Inc.',
		themeColor: '#FE8552',
	},
	'the-decrypting-story': {
		newsletterText: 'Get stories of change makers and innovators from the startup ecosystem in your inbox',
		themeColor: '#8777ff',
	},
};
