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
		new WechatappPlugin({
			// componentsPath:['aaa']
		})
		// new wxAppPlugin({
		// 	// extensions: [`.${ext}`, '.js'],
		// }),
	],
	devtool: 'source-map',
	// resolve: {
	// 	modules: [`src/${ext}`, 'node_modules'],
	// 	extensions: ['.js', '.ts', '.json'],
	// },
};