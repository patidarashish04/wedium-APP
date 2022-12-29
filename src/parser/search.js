// post info
const postInfo = (post, format) => {
	if (format === 'app') {
		const author = post.authors && post.authors.length > 0 && post.authors[0] ? post.authors[0] : {
			slug: 'varsha-2',
			name: 'YS-Team',
			imageUrl: 'https://images.yourstory.com/cs/static/default-ys-image.jpg',
		};
		const category = post.category && post.category.slug ? post.category : {
			name: 'Stories',
			slug: 'ys-stories',
		};
		return {
			featured_image: post.artwork,
			optimised_featured_image: `${post.artwork}?fm=png&auto=format&mode=crop&ar=2:1`,
			title: post.title,
			excerpt: post.description,
			reading_time: post.readTime,
			author_name: author.name,
			author_profile_image: author.imageUrl ? author.imageUrl : 'https://images.yourstory.com/cs/static/default-ys-image.jpg',
			primary_category: JSON.stringify(category),
			permalink: post.url,
			author_page: `/author/${author.slug}`,
			published_date: (new Date(post.publishedAt)).toISOString(),
			category_page: `/category/${category.slug}`,
		};
	}
	return ({
		title: post.title,
		description: post.description,
		artwork: post.artwork,
		url: post.url,
	});
};

module.exports = {
	postInfo,
};
