import moment from 'moment';
import _ from 'lodash';
import logger from './logger';

const levenshtein = require('js-levenshtein');

async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}

function abbreviateNumber(count) {
	let shortValue = 0;
	let suffix = '';
	if (count >= 1e12) {
		suffix = ' Trillion';
		shortValue = count / 1e12;
	} else if (count >= 1e9) {
		suffix = ' Billion';
		shortValue = count / 1e9;
	} else if (count >= 1e6) {
		suffix = ' Million';
		shortValue = count / 1e6;
	} else if (count >= 1e3) {
		suffix = ' Thousand';
		shortValue = count / 1e3;
	} else {
		suffix = '';
		shortValue = count;
	}
	shortValue = shortValue.toFixed(0);
	const result = shortValue + suffix;
	return result;
}

const getReadableCount = (count, scaleFormat = 1) => {
	const denominations = ['', 'k', 'M', 'B', 'T', 'P', 'E'];

	// what tier? (determines SI symbol)
	const tier = Math.log10(count) / 3 | 0;

	// if zero, we don't need a suffix
	if (tier === 0) return count;

	// get suffix and determine scale
	const suffix = denominations[tier];
	const scale = Math.pow(10, tier * 3);

	// scale the count
	const scaled = count / scale;

	// format count and add suffix
	if (scaleFormat > 1) {
		return parseFloat(scaled.toFixed(scaleFormat)) + suffix;
	}
	return scaled.toFixed(1) + suffix;
};

function humanizeTime({
	timestamp, key = 'posted',
}) {
	const now = moment().utc();
	const sourceTime = moment(timestamp).utc();
	const momentDateDiff = moment.duration(now.diff(sourceTime));
	let time_lapsed = `${key} on ${sourceTime.format('Do MMMM YYYY')}`;
	if (momentDateDiff.hours() < 1) {
		time_lapsed = `${key} Just Now`;
	} else if (momentDateDiff.hours() < 10) {
		time_lapsed = `${key} ${momentDateDiff.humanize()} ago`;
	}
	return time_lapsed;
}

function normalizeInteger(stringToCheck, defaultValue) {
	return _.isInteger(Number(stringToCheck)) ? Number(stringToCheck) : defaultValue;
}

function normalizeString(stringToCheck, defaultValue) {
	return stringToCheck && _.isString(stringToCheck) ? stringToCheck : defaultValue;
}

const getLapsedTime = (sourceTime) => {
	const mSourceTime = moment(sourceTime);
	const now = moment().tz('Asia/Kolkata');
	const momentDateDiff = moment.duration(now.diff(mSourceTime));
	let time_lapsed;
	if (momentDateDiff.days() > 0 || momentDateDiff.months() > 0 || momentDateDiff.years() > 0) {
		time_lapsed = mSourceTime.format('Do MMMM YYYY');
	} else if (momentDateDiff.hours() < 1) {
		time_lapsed = 'Just Now';
	} else if (momentDateDiff.hours() < 10) {
		time_lapsed = `${momentDateDiff.humanize()} ago`;
	} else {
		time_lapsed = mSourceTime.format('Do MMMM YYYY');
	}
	return time_lapsed;
};

const convertSecondsToISO8601 = (totalDuration) => {
	if (totalDuration) {
		const hour = parseInt(totalDuration / 3600);
		const minutes = parseInt(totalDuration / 60);
		const seconds = parseInt(totalDuration % 60);
		return `PT${hour}H${minutes}M${seconds}S`;
	} if (!_.isNumber(totalDuration)) {
		try {
			// send it to this function and it should be done
			return convertSecondsToISO8601(parseInt(totalDuration));
		} catch (e) {
			logger.error(`Failed to convert ${totalDuration} to ISO 8601 format`, e);
		}
	}
	return 'PT0S';
};

const convertStringToBoolean = (strValue) => (strValue ? strValue.toLowerCase() === 'true' : false);

function slugify(data) {
	const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
	const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
	const p = new RegExp(a.split('').join('|'), 'g');

	return data.toString().toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
		.replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w-]+/g, '') // Remove all non-word characters
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}

const arrayToObject = (array, keyField) => array.reduce((obj, item) => {
	obj[item[keyField]] = item;
	return obj;
}, {});

// extract user id from req res
function extractUserIdReqRes({ req, res }) {
	try {
		let userId = null;
		if (req.params.platform && ['android', 'ios'].includes(req.params.platform)) {
			if (res.locals && res.locals.userData) {
				userId = res.locals.userData.id ? res.locals.userData.id : null;
				delete res.locals.userData;
			}
		} else {
			userId = req.user && req.user.id && req.user.id ? req.user.id : null;
		}

		return userId;
	} catch (e) {
		return null;
	}
}

// Creates a random Alpha-Numeric string
function createAlphaNumericString(size = 32) {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < size; i += 1) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function getCurrencyUnitValue(amount) {
	const str = amount.toString();
	const length = str.length;
	let value;
	let unit;
	if (length <= 6) {
		// thousand
		value = amount / 1000;
		unit = 'THOUSAND';
	} else if (length >= 7 && length <= 9) {
		// million
		value = amount / 1000000;
		unit = 'MILLION';
	} else if (length >= 10 && length <= 12) {
		// billion
		value = amount / 1000000000;
		unit = 'BILLION';
	} else {
		// trillion
		value = amount / 1000000000000;
		unit = 'TRILLION';
	}
	return {
		value,
		unit,
	};
}

function getAmountAsNumber(value, unit) {
	let amount;
	switch (unit) {
	case 'THOUSAND':
		amount = value * 1000;
		break;
	case 'MILLION':
		amount = value * 1000000;
		break;
	case 'BILLION':
		amount = value * 1000000000;
		break;
	case 'TRILLION':
		amount = value * 1000000000000;
		break;
	default:
		break;
	}
	return Math.round(amount);
}

function removeUpdatedItemFromList(allData, updatedData) {
	const updatedIds = updatedData.map((item) => item.id);
	const trimmed = allData.reduce((acc, curr) => {
		if (!updatedIds.includes(curr.id)) {
			acc.push(curr);
		}
		return acc;
	}, []);
	return trimmed;
}

function getFormattedDate(date, format) {
	try {
		let responseFormat = 'Do MMM YYYY';
		if (format === 'MONTH') {
			responseFormat = 'MMM YYYY';
		} else if (format === 'YEAR') {
			responseFormat = 'YYYY';
		}
		const timestamp = moment(date);
		const response = `${timestamp.format(responseFormat)}`;
		return response;
	} catch (e) {
		return date;
	}
}

function currencySymbol(currency) {
	switch (currency) {
	case 'USD':
		return '$';
	case 'EUR':
		return '€';
	case 'GBP':
		return '£';
	case 'INR':
		return '₹';
	case 'JPY':
		return '¥';
	case 'CNY':
		return '¥';
	default:
		return currency;
	}
}

function getFormattedAmount({ currency, value, unit }) {
	try {
		if (currency && value && unit) {
			const amount = getAmountAsNumber(value, unit);
			const readableAmount = getReadableCount(amount, 2);
			const symbol = currencySymbol(currency);
			return `${symbol}${readableAmount}`;
		}
		return null;
	} catch (e) {
		return null;
	}
}

function filterSimilarTopics(key, list) {
	const similar = [];
	for (let i = 0; i < list.length; i++) {
		const charDiff = levenshtein(key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(), list[i].name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
		const condition = (charDiff === 0) || (charDiff === 1 && key.length > 3) || (charDiff === 2 && key.length > 5) || (charDiff === 3 && key.length > 9) || (charDiff === 4 && key.length > 13);
		if (condition) {
			similar.push(list[i]);
		}
	}
	return similar;
}

function getFormattedDateObj(date, format) {
	try {
		let responseFormat = 'Do MMM YYYY';
		let response;
		if (format === 'MONTH') {
			responseFormat = 'MMM YYYY';
		} else if (format === 'YEAR') {
			responseFormat = 'YYYY';
		}
		const timestamp = moment(date);
		const dateArray = timestamp.format(responseFormat).split(' ');

		if (responseFormat === 'YYYY') {
			response = {
				year: dateArray[0],
				month: null,
				date: null,
			};
		} else if (responseFormat === 'MMM YYYY') {
			response = {
				year: dateArray[1],
				month: dateArray[0],
				date: null,
			};
		} else {
			response = {
				year: dateArray[2],
				month: dateArray[1],
				date: dateArray[0],
			};
		}
		return response;
	} catch (e) {
		return date;
	}
}

module.exports = {
	asyncForEach,
	abbreviateNumber,
	humanizeTime,
	normalizeInteger,
	normalizeString,
	convertSecondsToISO8601,
	getLapsedTime,
	convertStringToBoolean,
	slugify,
	arrayToObject,
	extractUserIdReqRes,
	createAlphaNumericString,
	getCurrencyUnitValue,
	getAmountAsNumber,
	removeUpdatedItemFromList,
	getFormattedDate,
	getFormattedAmount,
	getReadableCount,
	filterSimilarTopics,
	getFormattedDateObj,
};
