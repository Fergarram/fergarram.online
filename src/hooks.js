const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const os = require('os');

const hooks = [
	{
		hook: 'bootstrap',
		name: 'copyAssetsToPublic',
		description: 'Copies ./assets/ to the "distDir" defined in the elder.config.js. This function helps support the live reload process.',
		run: ({ settings }) => {
			// Copy assets from 'assets' to 'public'
			glob.sync(path.resolve(settings.rootDir, './assets/**/*')).forEach((file) => {
				const parsed = path.parse(file);
				if (parsed.ext && parsed.ext.length > 0) {
					const relativeToAssetsFolder = path.relative(path.join(settings.rootDir, './assets'), file);
					const outputPath = path.resolve(settings.distDir, relativeToAssetsFolder);
					fs.ensureDirSync(path.parse(outputPath).dir);
					fs.outputFileSync(outputPath, fs.readFileSync(file));
				}
			});
		},
	}
];
module.exports = hooks;
