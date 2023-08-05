const fs = require('fs');
const path = require('path');
const { decode, encode } = require('html-entities');
const { slugify, findEmoji } = require('./utils');

function compileImage(route, md, openPattern = '{{', closePattern = '}}') {
	const result = [];

	const ObsidianEmbedFile = /!\[\[([^]*?)\]\]/g;
	const embedMatch = ObsidianEmbedFile.exec(md);
	if (embedMatch) {
		const [ embedCode, embedFilename ] = embedMatch;
		console.log(embedCode, embedFilename);

		if (
			embedFilename.includes('.png') ||
			embedFilename.includes('.jpg') ||
			embedFilename.includes('.jpeg') ||
			embedFilename.includes('.gif') ||
			embedFilename.includes('.bmp') ||
			embedFilename.includes('.svg')
		) {
			let imageName = embedFilename
				.replace('.png', '').replace('.jpg', '').replace('.jpeg', '')
				.replace('.gif', '').replace('.bmp', '').replace('.svg', '');
			console.log(imageName);
			const imageUrl = slugify(embedFilename).replace(/^-/g, '');
			md = md.replace(embedCode, `<div class="md-img">${openPattern}picture alt="${imageName}" src="/images/${route.name}/${embedFilename}" /${closePattern}</div>`);
		}
	}
	
	let match;
	const MDImgRegex = /!\[([A-Za-z-_ \d]*)\]\(([^)]*)\)/gm;

	let lastIndex = 0;
	while ((match = MDImgRegex.exec(md)) !== null) {
		const [, alt, src] = match;
		result.push(
			md.slice(lastIndex, match.index),
			`<div class="md-img">${openPattern}picture alt="${alt}" src="${src}" /${closePattern}</div>`,
		);
		lastIndex = MDImgRegex.lastIndex;
	}

	result.push(md.slice(lastIndex));
	return result.join('');
}

async function createMarkdownStore({
	pluginConfig,
	root,
	route,
	file,
	slug,
	shortcodes: { openPattern, closePattern } = {},
	parser,
	useImagePlugin = false,
	preserveFolderStructure = false,
}) {
	const ret = {
		slug: null,
		filename: null,
		frontmatter: null,
		html: null,
		data: null,
		compileHtml,
	};

	let source = fs.readFileSync(file, 'utf-8');
	let obsidianComments = source.match(/\%\%([^]*?)\%\%/g);
	if (obsidianComments && obsidianComments.length > 0) {            
		// console.log(obsidianComments.length);
		obsidianComments.forEach(item => {
			source = source.replace(item, `<div class="md-comment">${item.replace(/\%\%/g, '').replace(/\n/g, '<br>')}</div>`);
		});
	}
	const matches = source.match(/\s*^---[^\S\r\n]*\r?\n[\s\S]*?^---[^\S\r\n]*\r?(\n|$)/my);
	const header = matches && matches[0];
	if (!header) {
		ret.frontmatter = {};
	} else {
		const result = await parser.process(header);
		ret.frontmatter = result.data.frontmatter || {};
	}
	const { fileSlug, filename, breadcrumbs } = getSlug();
	ret.slug = fileSlug;
	ret.filename = filename;
	return ret;

	function getSlug() {
		let output = {};
		const relativePath = path.relative(root, file).replace(/\\/g, '/');

		let parts = relativePath.replace('vault/', '').replace('.md', '').split('/');
		parts = parts.map(s => slugify(s).replace(/^-/g, ''));

		let folderIndex = route.folderIndex || 'index';

		if (folderIndex === 'same-as-parent') {
			let parent = parts[parts.length - 2];
			let name = parts[parts.length - 1];

			if (parent === name) {
				parts.splice(parts.length - 2, 1);
			}

		} else {
			let name = parts[parts.length - 1];
			if (name === folderIndex) {
				parts.pop();
			}
		}

		const finalSlug = parts.join('/');
		output.fileSlug = finalSlug === route.home ? '/' : finalSlug;

		if (slug && typeof slug === 'function') {
			const result = pluginConfig.slugFormatter(relativePath, ret.frontmatter);
			if (typeof result === 'string') {
				output.fileSlug = result;
			}
		}

		if (ret.frontmatter.slug && !output.fileSlug) {
			output.fileSlug = ret.frontmatter.slug;
		}

		const fileName = preserveFolderStructure ? relativePath : file.split('/').pop();
		output.filename = fileName.replace('.md', '');
		if (!output.fileSlug) output.fileSlug = fileName.replace('.md', '').replace(/ /gim, '-');

		return output;
	}

	async function compileHtml() {
		if (ret.html != null) return;

		if (useImagePlugin) {
			source = compileImage(route, source, openPattern, closePattern);
		}

		const result = await parser.process(source);
		source = null;
		ret.html = result.contents;
		ret.frontmatter = result.data.frontmatter || {};
		delete result.data.frontmatter;
		ret.data = result.data;
	}
}
module.exports = createMarkdownStore;
