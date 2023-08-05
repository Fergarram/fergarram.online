const obscureConfig = require('./obscure.config.js');
require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
	origin: 'localhost:1122',
	lang: 'en',
	srcDir: 'src',
	distDir: 'public',
	rootDir: process.cwd(),
	build: {},
	prefix: '',
	server: {
		cacheRequests: false,
	},
	props: {
		hydration: isDev ? 'html' : 'hybrid',
		compress: true,
	},
	debug: {
		reload: false,
		stacks: false,
		hooks: false,
		performance: false,
		build: false,
		automagic: false,
	},
	hooks: {},
	plugins: {
		'obsidian-parser': obscureConfig,
		// '@elderjs/plugin-images': {
		// 	widths: [1280, 992, 768, 576, 400, 350, 200],
		// 	fileTypes: ['webp'],
		// 	folders: [
		// 		{
		// 			src: '/assets/images/*',
		// 			output: '/images/',
		// 		},
		// 		// {
		// 		// 	src: `/src/routes/**/vault${obscureConfig.mediaFolder}`,
		// 		// 	output: '/images/',
		// 		// },
		// 	],
		// },
	},
	shortcodes: { closePattern: '}}}', openPattern: '{{{' },
};
