module.exports = [
	{
		shortcode: 'mdComment',
		run: async ({ content, props }) => {
			return {
				html: `<pre class="md-comment">${content}</pre>`,
				css: '',
				js: '',
				head: '',
			};
		},
	}
];
