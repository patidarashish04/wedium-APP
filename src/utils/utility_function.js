import logger from './logger';

const bcrypt = require('bcrypt-nodejs');

const { APP_ENV } = process.env;
const cheerio = require('cheerio');
const moment = require('moment');

function trimAnyCharacter(s, c) {
	let ch = c;
	if (ch === ']') ch = '\\]';
	if (ch === '\\') ch = '\\\\';
	return s.replace(new RegExp(
		`^[${ch}]+|[${ch}]+$`, 'g',
	), '');
}

function extractSlugFromUrl(url) {
	let urlToBeModified = url;
	const n = urlToBeModified.indexOf('?');
	urlToBeModified = urlToBeModified.substring(0, n !== -1 ? n : urlToBeModified.length);
	urlToBeModified = trimAnyCharacter(urlToBeModified, '/');
	return urlToBeModified.split('/')[urlToBeModified.split('/').length - 1].replace(/\//g, '');
}

function hashSecret(SECRET_KEY) {
	return bcrypt.hashSync(SECRET_KEY, bcrypt.genSaltSync(8), null);
}

function compareHash(SECRET_KEY, receivedHash) {
	return bcrypt.compareSync(SECRET_KEY, receivedHash);
}

function isAboveAuthor(user) {
	let isAbove = false;

	if (((typeof user) === 'object') && ('roles' in user) && ((typeof user.roles) === 'object') && ('brand' in user.roles) && ((typeof user.roles.brand) === 'object') && (Object.keys(user.roles.brand).length > 0)) {
		Object.keys(user.roles.brand).forEach((key) => {
			if (user.roles.brand[key] > 1) {
				isAbove = true;
			}
		});
	}
	return isAbove;
}

function checkNested(obj, ...args) {
	let copyObj = obj;

	for (let i = 0; i < args.length; i += 1) {
		if (!copyObj || !(args[i] in copyObj)) {
			return false;
		}
		copyObj = copyObj[args[i]];
	}
	return true;
}

const checkType = (value, valueType) => {
	if (value === null) {
		if (valueType !== 'null') {
			return false;
		}
	} else if (value === undefined) {
		if (valueType !== 'undefined') {
			return false;
		}
	} else if (((typeof value) !== valueType)) {
		return false;
	}
	return true;
};

// Check for multiple values, Not to be used for objects
function checkIfArray(value, length = 0) {
	if (value && ('length' in value) && (value.length >= length)) {
		return true;
	}
	return false;
}

function unflatArray(arr, fnc) {
	if (!arr || !arr.length) {
		return [];
	}
	let preValue;
	let chunk = [];
	const result = [chunk];
	arr.forEach((currentValue, index) => {
		// create new chunk if fnc() returns truthy
		if (index !== 0 && fnc(index, preValue, currentValue)) {
			chunk = [];
			result.push(chunk);
		}
		chunk.push(currentValue);
		preValue = currentValue;
	});
	return result;
}

function urlBelongsTo(url, stringValue) {
	if (checkType(url, 'string')) {
		return url.includes(stringValue);
	}
	return false;
}

function equalToAny(value, matchValues = []) {
	if (checkType(matchValues, 'object') && ('length' in matchValues) && (matchValues.length > 0)) {
		return matchValues.includes(value);
	}
	return false;
}

function deskEmailTriggerRequired(brandObj) {
	if (APP_ENV === 'production') {
		if (checkType(brandObj, 'object') && checkNested(brandObj, 'locale') && checkNested(brandObj, 'name') && checkNested(brandObj, 'internal')) {
			if (equalToAny(brandObj.locale, ['en', 'en-US', 'EN-US', 'en-us', 'english', 'en_US', 'EN_US', 'en_us']) && equalToAny(brandObj.internal, [true])) {
				return true;
			}
			return false;
		}
	}
	return false;
}

const convertFileNameToSlug = (filename) => {
	const str = extractFileName(filename);
	let mstr = str.replace(/^\s+|\s+$/g, ''); // trim
	mstr = mstr.toLowerCase();
	const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
	const to = 'aaaaeeeeiiiioooouuuunc------';
	for (let i = 0, l = from.length; i < l; i += 1) {
		mstr = mstr.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}
	mstr = mstr.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-'); // collapse dashes
	mstr = mstr.slice(0, 50);
	if (mstr === '') {
		mstr = `No-name-${new Date().getTime()}`;
	} else {
		mstr = `${mstr}-${new Date().getTime()}`;
	}
	return mstr;
};

function extractFileName(filename) {
	if (checkType(filename, 'string')) {
		const parts = filename.split('.');
		if (parts && ('length' in parts) && (parts.length > 1)) {
			parts[parts.length - 1] = '';
			return trimAnyCharacter(parts.join('.'), '.');
		}
	}
	return '';
}

function extractExtensionFromName(filename) {
	if (checkType(filename, 'string')) {
		const parts = filename.split('.');
		if (('length' in parts) && (parts.length > 1) && (parts[parts.length - 1])) {
			return parts[parts.length - 1];
		}
	}
	return null;
}

function isUrlValid(str) {
	const pattern = new RegExp('^(https?:\\/\\/)?' // protocol
      + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
      + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
      + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
      + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
      + '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return pattern.test(str);
}

function escapeCharacters(text) {
	return text.replace(/'/g, "''");
}

function mapValues(value) {
	if (value === 'undefined') {
		return undefined;
	} if (value === 'null') {
		return null;
	} if (value === 'false') {
		return false;
	} if (value === 'true') {
		return true;
	}
	return value;
}

function extractTextFromHtml(para) {
	const $ = cheerio.load(para);
	return $('p *').contents().map(function () {
		return (this.type === 'text') ? $(this).text() : '';
	}).get()
		.reduce((acc, cur) => {
			if (cur !== '') {
				return [...acc, cur];
			}
			return acc;
		}, [])
		.join(' ');
}

function sortObjects(objectToSort, key) {
	return objectToSort.sort((obj, obj2) => {
		if (obj[key] < obj2[key]) {
			return -1;
		} if (obj[key] > obj2[key]) {
			return 1;
		}
		return 0;
	});
}

function CustomError(name, description, debugData) {
	const e = new Error(description);
	e.name = name;
	e.debugData = JSON.stringify(debugData);
	return e;
}

function generatePassword(passwordLength = 12) {
	const keyListAlpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const keyListInt = '0123456789';
	const keyListSpec = '!@#_';
	let password = '';
	let len = Math.ceil(passwordLength / 2);
	len -= 1;
	const lenSpec = passwordLength - (2 * len);

	for (let i = 0; i < len; i++) {
		password += keyListAlpha.charAt(Math.floor(Math.random() * keyListAlpha.length));
		password += keyListInt.charAt(Math.floor(Math.random() * keyListInt.length));
	}

	for (let i = 0; i < lenSpec; i++) password += keyListSpec.charAt(Math.floor(Math.random() * keyListSpec.length));

	password = password.split('').sort(() => 0.5 - Math.random()).join('');

	return password;
}

const getReadableTimestamp = (value) => {
	const now = moment(new Date());
	const end = moment(value);
	const duration = moment.duration(now.diff(end));
	const hours = Math.round(duration.asHours());
	let minutes;
	if (hours <= 24) {
		if (hours < 1) {
			minutes = Math.round(duration.asMinutes());
			return `${minutes || 1} minute${minutes > 1 ? 's' : ''} ago`;
		}
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	}
	return new Date(value).toDateString();
};

const secondsToHhmmss = (secs) => {
	secs = Math.floor(secs) || 0;
	let minutes = Math.floor(secs / 60);
	secs %= 60;
	const hours = Math.floor(minutes / 60);
	minutes %= 60;
	return `${(`0${hours}`).slice(-2)}:${(`0${minutes}`).slice(-2)}:${(`0${secs}`).slice(-2)}`;
};

const parseFormData = (formData, avoidKeys = []) => {
	try {
		const input = { ...formData };
		Object.keys(input).forEach((key) => {
			if (!avoidKeys.includes(key)) {
				try {
					input[key] = JSON.parse(input[key]);
				// eslint-disable-next-line no-empty
				} catch (e) {}
			}
		});
		return input;
	} catch (error) {
		logger.error('Failed to parse formData :[[JSON.stringify(formData));]] ', error);
		return formData;
	}
};

const parseDate = (str) => {
	const mdy = str.split('-');
	return new Date(mdy[0], mdy[1] - 1, mdy[2]);
};

// Take the difference between the dates and divide by milliseconds per day.
// Round to nearest whole number to deal with DST.
const datediff = (first, second) => Math.round((second - first) / (1000 * 60 * 60 * 24));

module.exports = {
	convertFileNameToSlug,
	deskEmailTriggerRequired,
	urlBelongsTo,
	checkNested,
	checkType,
	checkIfArray,
	unflatArray,
	isAboveAuthor,
	hashSecret,
	compareHash,
	trimAnyCharacter,
	extractSlugFromUrl,
	extractExtensionFromName,
	isUrlValid,
	escapeCharacters,
	mapValues,
	extractTextFromHtml,
	sortObjects,
	CustomError,
	generatePassword,
	getReadableTimestamp,
	secondsToHhmmss,
	parseFormData,
	parseDate,
	datediff,
};
