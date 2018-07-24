const webpack = require('webpack');
const path = require('path');
const WechatappPlugin = require('../index');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const NODE_MODULES_PATH = path.join(path.resolve(__dirname, '../'), 'node_modules');
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
	plugins: [
		new WechatappPlugin({
			// fileLoaderExt:['less']
			extraCommonsChunkPluginsConfig: [
				{
					name: 'proxy',
					// children:true,
					minChunks: (module, count) => {
						if (module.context) {
							return [
								'modules/index',
								'testmodule2',
								'utils'
							].some(dir => {
								return module.context.indexOf(dir) > -1;
							});
						}
						return count >= 2;
					}
				},
				{
					name: 'page_index',
					chunks: ['proxy'],
					minChunks: (module, count) => {
						if (module.context) {
							return module.context.indexOf('modules/index') > -1;
						}
					}
				},
				{
					name: 'util',
					chunks:['proxy'],
					minChunks: (module, count) => {
						if (module.context) {
							return module.context.indexOf('utils') > -1;
						}
					}
				},
			],
			injectEntry: [
				{
					name: 'app',
					chunks: ['proxy','util','page_index']
				}
				// {
				// 	name: 'pages/index/index',
				// 	chunks: ['page_index']
				// }
			],
			minChunks: Infinity
		}),
		new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			reportFilename: 'test.report.html',
			openAnalyzer: false,
		})
	],
	module: {
		rules: [{
			test: /\.less$/,
			use: WechatappPlugin.wrapStyleLoaderConfig({
				loader: 'less-loader'
			})
		}]
	},
	devtool: 'source-map',
};