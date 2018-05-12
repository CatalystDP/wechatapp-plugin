const webpack = require('webpack');
const wxAppPlugin = require('wxapp-webpack-plugin').default;
const Targets = require('wxapp-webpack-plugin').Targets;
const path = require('path');
const WechatappPlugin = require('../index');


module.exports = {
	entry: {
        app:path.join(__dirname,'src/app.js')
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			// {
			// 	test: /\.(wxss|wxml|json|png)$/,
			// 	loader: 'file-loader',
			// 	options: {
			// 		useRelativePath: true,
			// 		name: '[name].[ext]',
			// 	}
			// },
		],
	},
	resolve:{
		alias:{
			util:path.join(__dirname,'utils')
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