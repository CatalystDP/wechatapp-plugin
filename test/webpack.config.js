const webpack = require('webpack');
const path = require('path');
const WechatappPlugin = require('../index');

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
		new WechatappPlugin()
	],
	devtool: 'source-map',
};