const webpack = require('webpack');
const path = require('path');
const WechatAppPlugin = require('../dist/index');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NODE_MODULES_PATH = path.join(path.resolve(__dirname, '../'), 'node_modules');
const _ = require('lodash');
const glob = require('glob');
const fs = require('fs');
const del = require('del');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
let smp = new SpeedMeasurePlugin({
	outputTarget: path.join(__dirname, 'measure.log'),
	outputFormat: 'humanVerbose'
});
del.sync('./dist/**/*.*');
// fs.rmdirSync('./dist');
let webpackConfig = {
	entry: {
		app: path.join(__dirname, 'src/app.js'),
	},
	context:path.join(__dirname,'src'),
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		alias: {
			util: path.join(__dirname, 'utils')
		},
		extensions:['.ts','.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
							configFile: path.join(__dirname, 'tsconfig.json')
						}
					}
				],
			},
			{
				test: /\.(wxss)$/,
				use: WechatAppPlugin.wrapStyleLoaderConfig([], {
				})
			},
			{
				test: /\.(wxml)$/,
				use: WechatAppPlugin.wrapViewLoaderConfig([], {
				})

			},
			{
				test: /\.(png|jpeg)$/,
				use: [
					// WechatAppPlugin.util.fileLoader(),
					{
						loader: WechatAppPlugin.loaders.assetsLoader,
						options: {
							publicPath: 'https://www.testassets.com/assets',
							limit: 4 * 1024,//限制8k以上不能转base64
							fallback:'file-loader',
							fallbackOptions:{
								name:'[path][name].[ext]'
							}
						}
					}
				]
			},
			{
				test: /\.(json)$/,
				use: [
					WechatAppPlugin.util.fileLoader()
				]
			}
		]
	},
	plugins: [
		new WechatAppPlugin({
			useDefaultLoader: false,
			onAdditionalAssets:()=>{
				return [
					path.join('img/webpack-logo2.jpeg')
				].map(file=>path.join(__dirname,'src',file));
			}
			// fileLoaderExt: ['jpeg'],
			// picLoaderExt: ['jpeg'],
			// onStyleLoaders: () => {
			// 	return [
			// 		'extract-loader',
			// 		{
			// 			loader: 'css-loader',
			// 			options: {
			// 				import: false
			// 			}
			// 		}];
			// },
			// onPicLoaders: () => {
			// 	return [
			// 		{
			// 			loader: WechatAppPlugin.loaders.picLoader,
			// 			options:{},
			// 			// loader:'url-loader',
			// 			// options:{
			// 			// 	limit:8*1024,
			// 			// 	fallback:WechatAppPlugin.util.fileLoader()
			// 			// }
			// 		}
			// 	];
			// },
			// minChunks: (module, count) => {
			// 	return count >= 2;
			// },
			// onAdditionalEntry: () => {
			// 	const externalComponents = [
			// 		'list/list',
			// 		'a/list/list'
			// 	];
			// 	let entrys = {};
			// 	externalComponents.forEach(component => {
			// 		entrys[`external-components/${component}`] = path.resolve(__dirname, `../test-plugin/src/plugin/components/${component}`);
			// 	});
			// 	// entrys = {};
			// 	return entrys;
			// },
			// onAdditionalAssets: () => {
			// 	let assets = glob.sync('**/*.*', {
			// 		cwd: path.resolve(__dirname, '../test-plugin/src/plugin/components/'),
			// 		ignore: '**/*.js',
			// 		realpath: true
			// 	})
			// 	return assets;
			// },
			// onEmitAssets: (assets = {}) => {
			// 	let keys = Object.keys(assets);
			// 	let testComponentKey = keys.filter(key => {
			// 		return key.indexOf('test-plugin/src/plugin/components') > -1;
			// 	})
			// 	testComponentKey.forEach(key => {
			// 		let newkey = key.replace(/.*(test-plugin\/src\/plugin\/components\/)(.*)/g, 'external-components/$2');
			// 		assets[newkey] = assets[key];
			// 		delete assets[key];
			// 	});
			// }
		}),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: 'test.report.html',
			openAnalyzer: false,
		})
	],
	devtool: 'source-map',
};
// webpackConfig = smp.wrap(webpackConfig);
module.exports = webpackConfig;