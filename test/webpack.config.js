const webpack = require('webpack');
const path = require('path');
const WechatappPlugin = require('../');
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
		new WechatAppPlugin({
			minChunks: (module, count) => {
				return count >= 2;
			}
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