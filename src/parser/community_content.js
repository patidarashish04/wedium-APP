// community content info
const communityContentInfo = (data) => {
	const {
		id, title, url, type, source, thumbnail, brandInfo,
	} = data;
	if (type === 'ARTICLE') {
		return {
			id, title, url, type, source, thumbnail, brandInfo,
		};
	}
	const splitArr = url.split('/');
	const tweetId = splitArr[splitArr.length - 1];
	return {
		id, url, tweetId, type, source, brandInfo,
	};
};

const parseCoinData = ({
	id, rank, symbol, name, priceUsd, changePercent24Hr, explorer,
}) => ({
	id,
	rank,
	symbol,
	name,
	priceUsd,
	changePercent24Hr,
	explorer,
});

module.exports = {
	communityContentInfo,
	parseCoinData,
};
