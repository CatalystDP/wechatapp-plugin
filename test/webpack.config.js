const webpack = require('webpack');
const path = require('path');
const WechatAppPlugin = require('../dist/index');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NODE_MODULES_PATH = path.join(path.resolve(__dirname, '../'), 'node_modules');
const _ = require('lodash');
const glob = require('glob');
const fs = require('fs');
// fs.rmdirSync('./dist');
module.exports = {
	entry: {
		app: path.join(__dirname, 'src/app.js'),
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		alias: {
			util: path.join(__dirname, 'utils')
		}
	},
	module: {
		rules: [
			{
				test: /\.(wxml)$/,
				use: [
					WechatAppPlugin.util.fileLoader()
				]
			},
			{
				test: /\.(wxss|less)$/,
				use: WechatAppPlugin.wrapStyleLoaderConfig()
			},
			{
				test: /\.(png|jpeg)$/,
				use: [
					// WechatAppPlugin.util.fileLoader(),
					{
						loader: WechatAppPlugin.loaders.picLoader,
						options: {
							styleExt:['less']
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
			minChunks: (module, count) => {
				return count >= 2;
			},
			onAdditionalEntry: () => {
				const externalComponents = [
					'list/list',
					'a/list/list'
				];
				let entrys = {};
				externalComponents.forEach(component => {
					entrys[`external-components/${component}`] = path.resolve(__dirname, `../test-plugin/src/plugin/components/${component}`);
				});
				// entrys = {};
				return entrys;
			},
			onAdditionalAssets: () => {
				let assets = glob.sync('**/*.*', {
					cwd: path.resolve(__dirname, '../test-plugin/src/plugin/components/'),
					ignore: '**/*.js',
					realpath: true
				})
				return assets;
			},
			onEmitAssets: (assets = {}) => {
				let keys = Object.keys(assets);
				let testComponentKey = keys.filter(key => {
					return key.indexOf('test-plugin/src/plugin/components') > -1;
				})
				testComponentKey.forEach(key => {
					let newkey = key.replace(/.*(test-plugin\/src\/plugin\/components\/)(.*)/g, 'external-components/$2');
					assets[newkey] = assets[key];
					delete assets[key];
				});
			}
		}),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: 'test.report.html',
			openAnalyzer: false,
		})
	],
	devtool: 'source-map',
};