const webpack = require('webpack');
const path = require('path');
const WechatappPlugin = require('../index');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const glob = require('glob');
let baseConfig = {
	entry: {},
	output: {
		filename: '[name].js',
		// path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		alias: {
			util: path.join(__dirname, 'utils')
		}
	},
	devtool: 'source-map'
};
module.exports = [
	Object.assign({}, baseConfig, {
		entry: {
			app: path.join(__dirname, 'src/miniprogram/app.js'),
		},
		output: Object.assign({}, baseConfig.output, {
			path: path.join(__dirname, 'dist/miniprogram')
		}),
		plugins: [
			new WechatappPlugin()
		]
	}),
	Object.assign({}, baseConfig, {
		entry: {
			index: path.join(__dirname, 'src/plugin/index.js')
		},
		output: Object.assign({}, baseConfig.output, {
			path: path.join(__dirname, 'dist/plugin'),
			devtoolModuleFilenameTemplate: "webpack-wechatapp-plugin:///[resource-path]?[loaders]"
		}),
		plugins: [
			new WechatappPlugin({
				devMode: WechatappPlugin.mode.PLUGIN,
				jsonpFuncName: 'wechatAppPluginJsonp',
				onAdditionalEntry: function () {

				},
				onAditionalAssets: function () {
					return [];
				},
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				reportFilename:'plugin-report.html',
				openAnalyzer: false,
			})
		]
	}),
	Object.assign({}, baseConfig, {
		entry: {
			index: 'a'
		},
		output: Object.assign({}, baseConfig.output, {
			path: path.join(__dirname, 'dist/custom')
		}),
		plugins: [
			new WechatappPlugin({
				devMode: WechatappPlugin.mode.CUSTOM,
				jsonpFuncName: 'customJsonp',
				projectRoot: path.join(__dirname, 'src/plugin/components'),
				customFiles: ['list/list.js', 'a/list/list.js'],
				onAdditionalEntry: function () {
					console.log('custom addional entry');
					return {
						'external-components/test-component': path.resolve(__dirname,'../test/src/components/test-component/test-component.js')
					};
				},
				onAdditionalAssets: function () {
					let assets = glob.sync('**/*.*',{
						cwd:path.resolve(__dirname,'../test/src/components/test-component/'),
						ignore:'**/*.js',
						realpath:true
					})
					return assets;
				},
				onEmitAssets: function (assets = {}) {

				}
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				reportFilename: 'custom-component.report.html',
				openAnalyzer: false,
			})//分析包内模块组成
		]
	})
];