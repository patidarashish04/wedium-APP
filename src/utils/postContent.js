import logger from './logger';

// create post json for mobile
const createPostJsonForMobile = (ops) => {
	let mobilePostJson = [];
	try {
		const whitespaceRegex = /[^\s]/;
		for (let i = 0; i < ops.length; i++) {
			let object = {};
			if (typeof (ops[i].insert) === 'string') {
				object.contentType = 'text';
				object.value = { formats: {} };
				const data = ops[i].insert;
				object.value.data = data;
				if (ops[i].attributes) {
					const format = { ...ops[i].attributes };
					if (format.header) {
						if (whitespaceRegex.test(data)) {
							object.value.data = data;
						} else {
							const response = getHeaderText(mobilePostJson);
							mobilePostJson = response.result;
							object.value.data = response.headerText;
						}
						object.value.formats.header = format.header;
					}
					if (format.bold) {
						object.value.formats.bold = true;
					}
					if (format.link) {
						object.value.formats.link = format.link;
					}
					if (format.italic) {
						object.value.formats.italic = true;
					}
					if (format.underline) {
						object.value.formats.underline = true;
					}
					if (format.blockquote) {
						object.contentType = 'blockquote';
						if (whitespaceRegex.test(data)) {
							object.value.data = data;
						} else if (mobilePostJson.length > 0) {
							const response = getBlockquoteTextObject(mobilePostJson);

							mobilePostJson = response.result;
							object.value.data = response.value;
						} else {
							object = null;
						}
					}
					if (format.script) {
						object.value.formats.script = format.script;
					}
					if (format.list) {
						mobilePostJson = addListFormatToItem(mobilePostJson, format.list);
					}
				}
			}
			if (typeof (ops[i].insert) === 'object') {
				const val = ops[i].insert;
				if (val.image) {
					object.contentType = 'image';
					if (typeof (val.image) === 'string') {
						if (val.image.includes('a12bc34de56fg')) {
							const url = val.image.split('a12bc34de56fg')[0];
							const caption = val.image.split('a12bc34de56fg')[1];
							object.value = {
								src: url,
								caption,
							};
						} else {
							object.value = {
								src: val.image,
							};
						}
					} else {
						object.value = {
							src: val.image.url,
							caption: val.image.caption,
						};
					}
				} else if (val.imagelink) {
					object.contentType = 'imageLink';
					object.value = {
						src: val.imagelink.imageUrl,
						link: val.imagelink.link,
						caption: val.imagelink.caption,
					};
				} else if (val.alsoread) {
					object.contentType = 'alsoRead';
					object.value = {
						title: val.alsoread.title,
						thumbnail: val.alsoread.thumbnail,
						publishedUrl: val.alsoread.publishedUrl,
					};
				} else if (val.facebook) {
					object.contentType = 'facebook';
					if (Object.keys(val.facebook).length > 0) {
						object.value = {
							id: val.facebook.id,
							url: getFacebookUrl(val.facebook.url),
						};
					} else {
						object = null;
					}
				} else if (val.linkbutton) {
					object.contentType = 'linkButton';
					object.value = {
						name: val.linkbutton.name,
						url: val.linkbutton.url,
					};
				} else if (val.tweet) {
					object.contentType = 'tweet';
					object.value = {
						id: val.tweet.id || '',
						url: val.tweet.url,
					};
				} else if (val.insta) {
					object.contentType = 'instagram';
					object.value = {
						id: val.insta.id,
						url: val.insta.url,
					};
				} else if (val.youtube) {
					object.contentType = 'youtube';
					object.value = {
						id: val.youtube.id,
					};
				} else if (val.soundcloud) {
					object.contentType = 'soundCloud';
					object.value = {
						id: val.soundcloud.id,
						url: val.soundcloud.url,
					};
				} else if (val.googleform) {
					object.contentType = 'googleForm';
					object.value = {
						url: val.googleform,
					};
				} else if (val.slideshare) {
					object.contentType = 'slideshare';
					object.value = {
						id: val.slideshare.id,
						url: val.slideshare.url,
					};
				} else if (val.html) {
					object.contentType = 'html';
					object.value = {
						html: val.html,
					};
				} else if (val.iframe) {
					object.contentType = 'iframe';
					object.value = {
						url: val.iframe,
					};
				} else if (val.divider) {
					object.contentType = 'divider';
					object.value = {};
				} else if (val.company) {
					object.contentType = 'companyWidget';
					object.value = { id: val.company.id };
				} else if (val.crux) {
					object.contentType = 'crux';
					object.value = {
						crux: val.crux.crux,
					};
				} else if (val.statistics) {
					object.contentType = 'statistics';
					object.value = {
						type: val.statistics.type,
						currencyType: val.statistics.currencyType,
						statisticAmount: val.statistics.statisticAmount,
						statisticText: val.statistics.statisticText,
						unit: val.statistics.unit,
						alignment: val.statistics.alignment,
					};
				} else if (val.quote) {
					object.contentType = 'quote';
					object.value = {
						quote: val.quote.quote.trim(),
						source: val.quote.source,
					};
				} else if (val.quoteAnotherSource) {
					object.contentType = 'quoteAnotherSource';
					object.value = {
						quote: val.quoteAnotherSource.quote,
						source: val.quoteAnotherSource.source,
					};
				} else if (val.video) {
					object.contentType = 'video';
					object.value = {
						mediaId: val.video.mediaId,
						platform: val.video.platform,
					};
				}
			}
			if (object) {
				mobilePostJson.push(object);
			}
		}
		return mobilePostJson;
	} catch (err) {
		logger.error(`mobile post json error with post json ${JSON.stringify(ops)}`, err);
		return [];
	}
};

// get facebook post url
const getFacebookUrl = (post) => {
	try {
		const arr = post.split('href=');
		return arr[1];
	} catch (err) {
		throw new Error(err);
	}
};

// Add List Format To Item
const addListFormatToItem = (allData, listtype) => {
	try {
		if (allData) {
			for (let i = allData.length - 1; i >= 0; i--) {
				const crrData = { ...allData[i] };
				if (crrData.contentType === 'text') {
					let text = crrData?.value?.data;
					const splitArr = text ? text.split('\n') : [];
					if (splitArr.length > 1) {
						const lastElement = splitArr[splitArr.length - 1];
						if (lastElement === '' && i + 1 < allData.length) {
							let j = i + 1;
							while (j < allData.length && allData[j].contentType !== 'text') j++;
							if (j < allData.length) {
								allData[j].value.formats = { ...allData[j].value.formats, list: listtype };
								return allData;
							}
						}
						text = text.replace(lastElement, '');
						allData[i].value.data = text;

						const newData = {
							...crrData,
							value: {
								...crrData.value,
								formats: {
									...crrData.value.formats,
									list: listtype,
								},
								data: lastElement,
							},
						};
						allData.splice(i + 1, 0, newData);
						return allData;
					}
				}
			}
			if (allData[0] && allData[0].value) allData[0].value.formats = { ...allData[0].value.formats, list: listtype };
		}
		return allData;
	} catch (err) {
		logger.error('Error formatting mobile post json in addListFormatToItem', err);
		return allData;
	}
};

// retrieve blockquote value from the post json object
const getBlockquoteTextObject = (allData) => {
	try {
		let outputText = '';
		for (let i = allData.length - 1; i >= 0; i--) {
			if (allData.length > 0) {
				const lastValue = { ...allData.pop() };
				if (lastValue.contentType === 'text') {
					let text = lastValue.value.data;
					if ([undefined, null].includes(text)) {
						text = '\n\n';
					}
					const splitArr = text.split('\n');
					if (splitArr.length > 1) {
						const lastElement = splitArr[splitArr.length - 1].toString();
						if (lastElement.length < 1) {
							if (outputText.length < 1) {
								if (splitArr.length === 2) {
									outputText = splitArr[0] + outputText;
									if (i === 0) {
										return {
											result: [],
											value: outputText,
										};
									}
								} else {
									const temp = splitArr[splitArr.length - 2];
									text = text.replace(temp, '');
									allData.push({
										contentType: 'text',
										value: {
											data: text,
										},
									});
									outputText = temp + outputText;
									return {
										result: allData,
										value: outputText,
									};
								}
							} else {
								allData.push(lastValue);
								i += 1;
								return {
									result: allData,
									value: outputText,
								};
							}
						} else {
							const temp = splitArr[splitArr.length - 1];
							text = text.replace(temp, '');
							allData.push({
								contentType: 'text',
								value: {
									data: text,
								},
							});
							outputText = temp + outputText;
							return {
								result: allData,
								value: outputText,
							};
						}
					} else {
						const formattedText = getFormattedBlockquoteString(lastValue);
						outputText = formattedText + outputText;
						if (i === 0) {
							return {
								result: [],
								value: outputText,
							};
						}
					}
				} else {
					allData.push(lastValue);
					const emptyText = {
						contentType: 'text',
						value: {},
					};
					allData.push(emptyText);
					i += 1;
				}
			} else {
				return {
					result: [],
					value: outputText,
				};
			}
		}
	} catch (err) {
		throw new Error(err);
	}
};

// this function generates html for the value from the style attributes
const getFormattedBlockquoteString = (obj) => {
	try {
		const formats = { ...obj.value.formats };
		let text = obj.value.data;
		if (Object.keys(formats).length > 0) {
			if (formats.bold) {
				text = `<b>${text}</b>`;
			}
			if (formats.italic) {
				text = `<em>${text}</em>`;
			}
			if (formats.underline) {
				text = `<u>${text}</u>`;
			}
			if (formats.link) {
				text = `<a href="${formats.link}">${text}</a>`;
			}
			if (formats.script === 'sub') {
				text = `<sub>${text}</sub>`;
			}
			if (formats.script === 'super') {
				text = `<sup>${text}</sup>`;
			}
		}
		return text;
	} catch (err) {
		throw new Error(err);
	}
};

const getHeaderText = (allData) => {
	try {
		let headerText = '';
		const lastValue = allData.pop();
		let lastText = lastValue?.value?.data;
		if (lastText) {
			const splitText = lastText.split('\n');
			if (splitText.length > 1) {
				if (splitText[splitText.length - 1].length > 0) {
					headerText = splitText[splitText.length - 1];
					lastText = lastText.replace(headerText, '');
					if (!lastText.endsWith('\n')) {
						lastText = `${lastText}\n`;
					}
					lastValue.value.data = lastText;

					allData.push(lastValue);
					headerText = `${headerText}\n`;
				} else {
					headerText = splitText[splitText.length - 2];
					lastText = lastText.replace(headerText, '');
					if (!lastText.endsWith('\n')) {
						lastText = `${lastText}\n`;
					}
					lastValue.value.data = lastText;
					allData.push(lastValue);
					headerText = `${headerText}\n`;
				}
			} else {
				headerText = `${splitText[0]}\n`;
			}
			return {
				result: allData,
				headerText,
			};
		}
		allData.push(lastValue);
		return {
			result: allData,
			headerText,
		};
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = {
	createPostJsonForMobile,
};
