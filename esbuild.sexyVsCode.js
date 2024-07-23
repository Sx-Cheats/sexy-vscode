const esbuild = require("esbuild");
const fs = require("fs");
const { $ } = require("zx");
const path = require("path");


const getVsCodeSettingsPath = async () => {

	const whoami = await $`whoami`;
	
  return `/Users/${whoami.stdout.trim().replace(/\n/g, '')}/Library/Application Support/Code/User/settings.json`;
}


const isCss = process.argv.includes('--css');
const isEsm = process.argv.includes('--js') || process.argv.includes('--esm'); 

const processArgs = {};

process.argv.forEach(function (val, index, array) {
	if(val.startsWith('--')) {
		const isArgLikeEqual = /--\w+=.+$/g.test(val);
		const argKey = !isArgLikeEqual ? val.replace(/^--/g, ''): val.replace(/^--/g, '').replace(/=.+/g, '');

		if(!isArgLikeEqual) {
				const arg =  array[index + 1];
				if(arg && !arg.startsWith('--') && index < array.length - 1) {
						processArgs[argKey] = array[index + 1];
				} else {
						processArgs[argKey] =  true;
				}
			} else {
				processArgs[argKey] = val.replace(/^--\w+=/g, '');
			}
	}
});

const esmVsCodeBuilderPlugin = {
	name: 'esm-vscode-builder-plugin',

	setup(build) {
		
		build.onStart(async () => {

			if(processArgs.reload ) { return;}

			const vsCodeSettingsPathForm = await getVsCodeSettingsPath();

			const vsCodeSettings = fs.readFileSync(vsCodeSettingsPathForm, "utf8");
			const vsCodeSettingsObject = JSON.parse(vsCodeSettings);

			const vsCodeCustomMinJs = `file://${path.resolve(__dirname, "dist/vscode.custom.min.js")}`;
			let fileModified = false;
			if(vsCodeSettingsObject["apc.imports"]) {
				if(Array.isArray(vsCodeSettingsObject["apc.imports"])) {
					if(!vsCodeSettingsObject["apc.imports"].includes(vsCodeCustomMinJs)) {
						fileModified = true;
						vsCodeSettingsObject["apc.imports"].push(vsCodeCustomMinJs);
					}
				} else {
					fileModified = true;
					vsCodeSettingsObject["apc.imports"] = [
          	vsCodeCustomMinJs
					]
				}
			} else {
				fileModified = true;
				vsCodeSettingsObject["apc.imports"] = [
					vsCodeCustomMinJs
				]
			}
			if(fileModified) {
			fs.writeFileSync(vsCodeSettingsPathForm, JSON.stringify(vsCodeSettingsObject, null, 2));
		}

		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

const cssVsCodeBuilderPlugin = {
	name: 'css-vscode-builder-plugin',

	setup(build) {
		
		build.onEnd(async () => {
			if(processArgs.reload ) { return;}

			const vsCodeSettingsPathForm = await getVsCodeSettingsPath();

      const vsCodeSettings = fs.readFileSync(vsCodeSettingsPathForm, "utf8");
			const vsCodeSettingsObject = JSON.parse(vsCodeSettings);

			const vsCodeCustomMinCss = `file://${path.resolve(__dirname, "dist/vscode.custom.min.css")}`;
			let fileModified = false;
			if(vsCodeSettingsObject["apc.imports"]) {
				if(Array.isArray(vsCodeSettingsObject["apc.imports"])) {
					if(!vsCodeSettingsObject["apc.imports"].includes(vsCodeCustomMinCss)) {
						fileModified = true;
						vsCodeSettingsObject["apc.imports"].push(vsCodeCustomMinCss);
					}
				} else {
					fileModified = true;
					vsCodeSettingsObject["apc.imports"] = [
          	vsCodeCustomMinCss
					]
				}
			} else {
				fileModified = true;
				vsCodeSettingsObject["apc.imports"] = [
					vsCodeCustomMinCss
				]
			}
			if(fileModified) {
			fs.writeFileSync(vsCodeSettingsPathForm, JSON.stringify(vsCodeSettingsObject, null, 2));
		}
		})
	}
}

async function main() {
	const esmBuilderContext = !isCss ? await esbuild.context({
		entryPoints: [
			'./vscode.custom.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: true,
		sourcemap: false,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/vscode.custom.min.js',
		logLevel: 'silent',
		plugins: [
			esmVsCodeBuilderPlugin
		],
	}) : null;

	const cssMinifyContext = !isEsm ? await esbuild.context({
		entryPoints: [
			'./vscode.custom.css'
		],
	  minify: true,  
    bundle: true, 
		outfile: 'dist/vscode.custom.min.css',
		logLevel: 'silent',
		plugins: [
			cssVsCodeBuilderPlugin
		],
	}): null

	if(esmBuilderContext) {
	await esmBuilderContext.rebuild();
	await esmBuilderContext.dispose();
	}

  if(cssMinifyContext) {
			await cssMinifyContext.rebuild();
			await cssMinifyContext.dispose();
	}
	
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
