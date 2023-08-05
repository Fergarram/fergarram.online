const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const remarkHtml = require('remark-html');
const remarkSlug = require('remark-slug');


const { decode, encode } = require('html-entities');
const { findEmoji, slugify } = require('./utils/utils');

const prepareMarkdownParser = require('./utils/prepareMarkdownParser');
const createMarkdownStore = require('./utils/markdownStore');

const extractFrontmatter = require('remark-extract-frontmatter');
const remarkFrontmatter = require('remark-frontmatter');
const yaml = require('yaml').parse;

const remarkPlugins = [
	remarkFrontmatter,
	[ extractFrontmatter, { name: 'frontmatter', yaml: yaml } ],
	remarkSlug,
	[ remarkHtml, { sanitize: false } ],
];

const arrangeIntoTree = (route, paths) =>  {
	let tree = [];

	const findWhere = (array, key, value) => {
		let t = 0;
		while (t < array.length && array[t][key] !== value) {
			t++;
		};

		if (t < array.length) {
			return array[t]
		} else {
			return false;
		}
	};

	for (let i = 0; i < paths.length; i++) {
		const filepath = paths[i];
		let currentLevel = tree;
		for (let j = 0; j < filepath.length; j++) {
			let part = filepath[j];

			let existingPath = findWhere(currentLevel, 'name', part.replace('.md', ''));

			if (existingPath) {
				currentLevel = existingPath.children;

			} else {
				let slug = slugify(part.replace('.md', '')).replace(/^-/g, '');
				slug = slug === route.home ? '/' : slug;

				const finalPath = filepath.map(p => slugify(p.replace('.md', '')).replace(/^-/g, '')).join('/');
				const finalParts = finalPath.split('/');

				let folderIndex = route.folderIndex || 'index';

				if (folderIndex === 'same-as-parent') {
					if (finalParts[finalParts.length - 2] === finalParts[finalParts.length - 1]) {
						finalParts.splice(finalParts.length - 2, 1);
					}

				} else {
					let name = finalParts[finalParts.length - 1];
					if (name === folderIndex) {
						finalParts.pop();
					}
				}

				if (route.prefix) finalParts.unshift(route.prefix);

				const newPart = {
					name: part.replace('.md', ''),
					slug,
					path: slug === '/' ? finalParts.slice(0,-1).join('/') : finalParts.join('/'),
					children: [],
				}

				currentLevel.push(newPart);
				currentLevel = newPart.children;
			}
		}
	}

	return tree;
};

const plugin = {
	name: 'obsidian-parser',
	description: '',
	init: async (plugin) => {
		// used to store the data in the plugin's closure so it is persisted between loads
		plugin.markdown = {};
		plugin.fileTree = [];
		plugin.requests = [];

		plugin.references = {};

		if (plugin.config.remarkPlugins.length === 0) {
			plugin.config.remarkPlugins = remarkPlugins;
		}

		if (plugin.config.useSyntaxHighlighting) {
			const rehypeShiki = require('./rehype-shiki');
			let rehypeShikiConfig = {};
			if (typeof plugin.config.useSyntaxHighlighting !== 'boolean') {
				rehypeShikiConfig = plugin.config.useSyntaxHighlighting;
			}
			plugin.config.remarkPlugins.push([rehypeShiki, rehypeShikiConfig]);
		}

		if (plugin.config.useTableOfContents) {
			const tableOfContents = require('./utils/tableOfContents');
			plugin.config.remarkPlugins.push(tableOfContents);
		}

		if (plugin.config.useGitHubFriendlyMarkdown) {
			const remarkGfm = require('remark-gfm');
			let gfmConfig = {};
			if (typeof plugin.config.useGitHubFriendlyMarkdown !== 'boolean') {
				gfmConfig = plugin.config.useGitHubFriendlyMarkdown;
			}
			plugin.config.remarkPlugins.push([remarkGfm, gfmConfig]);
		}

		plugin.markdownParser = prepareMarkdownParser(plugin.config.remarkPlugins);

		if (plugin.config && Array.isArray(plugin.config.routes) && plugin.config.routes.length > 0) {
			for (const route of plugin.config.routes) {
				plugin.markdown[route.name] = [];
				const contentPath = plugin.config.contents[route.name] || null;
				let mdsInRoute = path.resolve(plugin.settings.srcDir, './routes/', route.name);
				if (contentPath) {
					mdsInRoute = path.resolve(plugin.settings.rootDir, contentPath);
					if (!fs.existsSync(mdsInRoute)) {
						throw new Error(`elderjs-plugin-markdown: Unable to find path ${mdsInRoute}`);
					}
				}

				const mdFiles = glob.sync(`${mdsInRoute}/vault/**/*.md`);

				const paths = [];

				for (const file of mdFiles) {
					const markdown = await createMarkdownStore({
						pluginConfig: plugin.config,
						root: mdsInRoute,
						route,
						file,
						parser: plugin.markdownParser,
						useImagePlugin: plugin.settings.plugins['@elderjs/plugin-images'] && plugin.config.useElderJsPluginImages,
						shortcodes: plugin.settings.shortcodes
					});
					plugin.markdown[route.name].push(markdown);
					const relFilename = path.relative(mdsInRoute, file).replace(/\\/g, '/');
					const parts = relFilename.split('/');
					parts.shift(); // Remove the 'vault' folder container.
					paths.push(parts);
				}

				plugin.flatFileList = paths.map(filepath => {
					const finalPath = filepath.map(p => slugify(p.replace('.md', '')).replace(/^-/g, '')).join('/');
					const finalParts = finalPath.split('/');

					let folderIndex = route.folderIndex || 'index';

					if (folderIndex === 'same-as-parent') {
						if (finalParts[finalParts.length - 2] === finalParts[finalParts.length - 1]) {
							finalParts.splice(finalParts.length - 2, 1);
						}

					} else {
						let name = finalParts[finalParts.length - 1];
						if (name === folderIndex) {
							finalParts.pop();
						}
					}

					if (finalParts.length === 1 && finalParts[finalParts.length - 1] === route.home) finalParts.pop();

					if (route.prefix) finalParts.unshift(route.prefix);

					return {
						name: filepath[filepath.length - 1].replace('.md', ''),
						path: filepath.slice(0, -1).join(' / '),
						url: finalParts.join('/'),
					}
				});

				plugin.fileTree = arrangeIntoTree(route, paths);

				// if there is a date in frontmatter, sort them by most recent
				const haveDates = plugin.markdown[route.name].reduce((out, cv) => {
					return out && !!cv.frontmatter && !!cv.frontmatter.date;
				}, true);

				if (haveDates) {
					plugin.markdown[route.name] = plugin.markdown[route.name].sort(
						(a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date),
					);
				}
			}

			// Remove drafts on production. Add DRAFT: to the title on dev.
			Object.keys(plugin.markdown).forEach((route) => {
				if (process.env.NODE_ENV === 'production') {
					plugin.markdown[route] = plugin.markdown[route].filter(
						(md) => !md.frontmatter.draft && md.slug.indexOf('draft-') !== 0,
					);
				} else {
					plugin.markdown[route].forEach((md) => {
						if (md.frontmatter.draft || md.slug.indexOf('draft') === 0) {
							md.frontmatter.title = `DRAFT: ${md.frontmatter.title || 'MISSING TITLE'}`;
						}
					});
				}
			});

			// Loop through object to create requests
			Object.keys(plugin.markdown).forEach((route) => {
				plugin.markdown[route].forEach((md) => {
					plugin.requests.push({ slug: md.slug, route });
				});
			});
		}

		return plugin;
	},
	config: {
		routes: [],
		remarkPlugins: [], // if you define your own, you must define remarkHtml another html parser or you'll have issues. Order matters here.
		useElderJsPluginImages: false,
		useSyntaxHighlighting: false,
		useTableOfContents: false,
		useGitHubFriendlyMarkdown: true,
		createRoutes: true,
		contents: {},
	},
	shortcodes: [],
	hooks: [
		{
			hook: 'bootstrap',
			name: 'addMarkdownParserToHelpers',
			description:
				'Adds markdown parser to helpers so that it can be used other Elder.js plugins, user defined hooks, or in templates. ',
			priority: 99,
			run: async ({ helpers, plugin }) => {
				return {
					helpers: {
						...helpers,
						markdownParser: plugin.markdownParser,
					},
				};
			},
		},

		{
			hook: 'bootstrap',
			name: 'copyVaultMediaToPublic',
			description: 'Copy media from "media" folder in vault to "public" folder.',
			priority: 99,
			run: ({ settings, plugin }) => {
				plugin.config.routes.forEach(route => {
					const mediaPath = `src/routes/${route.name}/vault${route.mediaFolder}`
					glob.sync(path.resolve(settings.rootDir, `./${mediaPath}/**/*`)).forEach((file) => {
						const parsed = path.parse(file);
						if (parsed.ext && parsed.ext.length > 0) {
							let relativeToAssetsFolder = path.relative(path.join(settings.rootDir, `./${mediaPath}`), file.replace(parsed.ext, ''));
							relativeToAssetsFolder = slugify(relativeToAssetsFolder).replace(/^-/g, '') + parsed.ext;
							const outputPath = path.resolve(`${settings.distDir}/images/${route.name}`, relativeToAssetsFolder);
							fs.ensureDirSync(path.parse(outputPath).dir);
							fs.outputFileSync(outputPath, fs.readFileSync(file));
						}
					});
				});
			},
		},

		{
			hook: 'bootstrap',
			name: 'addMdFilesToDataObject',
			description: 'Add parsed .md content and data to the data object',
			priority: 99,
			run: async ({ data, plugin }) => {
				if (plugin.config.routes.length > 0) {
					return {
						data: {
							...data,
							markdown: plugin.markdown,
							routeFileTree: plugin.fileTree,
							flatFileList: plugin.flatFileList
						},
					};
				}
			},
		},
		{
			hook: 'allRequests',
			name: 'mdFilesToAllRequests',
			description:
				'Add collected md files to allRequests array using the frontmatter slug or filename as the slug. Users can modify the plugin.requests before this hook to change generated requests.',
			priority: 50,
			run: async ({ allRequests, plugin }) => {
				if (plugin.config.routes.length > 0 && plugin.config.createRoutes) {
					plugin.requests.forEach(request => {
						const routeObj = plugin.config.routes.find(r => r.name === request.route);
						if (routeObj && routeObj.prefix) {
							if (request.slug === '/') request.slug = routeObj.prefix;
							else request.slug = routeObj.prefix + '/' + request.slug;
						}
					});
					return {
						allRequests: [...allRequests, ...plugin.requests],
					};
				}
			},
		},
		{
			hook: 'request',
			name: 'resetReferencesOnRequest',
			description: `If references aren't reset, the plugin will collect references between page loads.`,
			run: async ({ request, plugin }) => {
				plugin.references[request.permalink] = [];
				return { plugin };
			},
		},
		{
			hook: 'data',
			name: 'addFrontmatterAndHtmlToDataForRequest',
			description: 'Adds parsed frontmatter and html to the data object for the specific request.',
			priority: 50,
			run: async ({ request, data, plugin }) => {
				if (data.markdown && data.markdown[request.route]) {
					const routeObj = plugin.config.routes.find(r => r.name === request.route);
					let prefix = routeObj && routeObj.prefix ? routeObj.prefix + '/' : '';
					const finalSlug = request.slug.replace(prefix, '') === routeObj.prefix ? '/' : request.slug.replace(prefix, '');
					const markdown = data.markdown[request.route].find((m) => m.slug === finalSlug);
					if (markdown) {
						await markdown.compileHtml();

						let { filename, html, frontmatter, data: addToData, slug } = markdown;
						let breadcrumbs = [];

						if (slug.split('/').length >= 1 && slug !== '/') {
							const urlParts = slug.split('/');

							let names = {};
							let tempTree = data.routeFileTree;
							for (let j = 0; j < urlParts.length; j++) {
								const newTree = tempTree.find((t) => t.slug === urlParts[j]);
								if (newTree) {
									names[newTree.slug] = newTree.name;
									tempTree = newTree.children;
								}
							}

							for (let j = 0; j < urlParts.length; j++) {
								breadcrumbs.push({
									name: names[urlParts[j]],
									slug: urlParts[j],
									url: '/' + prefix + urlParts.slice(0, j+1).join('/')
								});
							}
						}

						const ObsidianEmbedFile = /!\[\[([^]*?)\]\]/g;
						let embedMatch;
						while ((embedMatch = ObsidianEmbedFile.exec(html)) !== null) {
							const [ embedCode, embedFilename ] = embedMatch;
							if (
								embedFilename.includes('.png') ||
								embedFilename.includes('.jpg') ||
								embedFilename.includes('.jpeg') ||
								embedFilename.includes('.gif') ||
								embedFilename.includes('.bmp') ||
								embedFilename.includes('.svg')
							) {
								let ext = embedFilename.split('.');
								ext = ext[ext.length - 1]
								let imageName = embedFilename
									.replace('.png', '').replace('.jpg', '').replace('.jpeg', '')
									.replace('.gif', '').replace('.bmp', '').replace('.svg', '');
								const imageUrl = slugify(imageName).replace(/^-/g, '');
								const regSafeEmbedCode = embedCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
								const replacer = new RegExp(regSafeEmbedCode, 'g');
								html = html.replace(
									replacer,
									`<img alt="${imageName}" src="/images/${request.route}/${imageUrl}.${ext}" />`
								);
							}
						}

						prefix = routeObj && routeObj.prefix ? '/' + routeObj.prefix + '/' : '/';

						let internalLinks = html.match(/\[\[([^]*?)\]\]/g);
						if (internalLinks && internalLinks.length > 0) {
							internalLinks.forEach(link => {
								let inner = decode(link.replace('[[', '').replace(']]', ''));
								let nameParts = inner.split('/');
								let pages = data.markdown[request.route].filter((m) => m.filename === nameParts[nameParts.length - 1]);

								if (pages && pages.length > 1) {
									// @IMPROVE: I don't really trust this way of differentiating links with the same names.
									//           I need more test cases for this.
									let parts = nameParts.map(p => slugify(p).replace(/^-/g, ''));
									pages = pages.filter(p => p.slug === parts.join('/'))
								}

								let page = pages && pages.length > 0 ? pages[0] : null;

								if (page) {
									const emoji = findEmoji(inner);
									// @IMPROVE: This emoji condition seems finicky
									if (emoji && emoji[0] && inner[2] === ' ') inner = inner.replace(`${emoji[0]} `, `${emoji[0]}&nbsp;`);
									html = html.replace( link, `<a class="internal-link" href="${prefix}${page.slug}">${inner}</a>`);
								} else {
									html = html.replace( link, `<span class="ghost-link" title="Page not yet created.">${inner}</span>`);
								}
							});
						}

						if (!frontmatter) frontmatter = {};
						if (!frontmatter.title) frontmatter.title = filename;
						if (!frontmatter.description) {
							const emoji = findEmoji(html);
							let generatedSummary = '';

							if (emoji && emoji[0]) {
								generatedSummary = html.replace(emoji[0], '');
							}

							generatedSummary = generatedSummary
								.replace(/<h[^>]*>(.*?)<\/h[^>]>/g, '')
								.replace(/<div\ class\=\"md-comment\">(.*?)<\/div>/g, '')
								.replace(/<[^>]+>/g, '')
								.replace(/\&nbsp\;/g, ' ')
								.slice(0, 140)
								.trim();

							if (generatedSummary) {
								frontmatter.description = decode(generatedSummary, { level: 'all' }) + '...';
							} else {
								frontmatter.description = routeObj.description;
							}

						}
						if (!frontmatter.author) frontmatter.author = routeObj.author;

						return {
							data: {
								...data,
								...addToData,
								siteTitle: routeObj.title,
								locale: routeObj.locale,
								homeUrl: prefix,
								html,
								breadcrumbs,
								frontmatter,
							},
						};
					}
				}
			},
		},
	],
	remarkPlugins,
};

module.exports = plugin;
exports.default = plugin;
