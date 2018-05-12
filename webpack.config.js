const webpack = require('webpack');
const wxAppPlugin = require('wxapp-webpack-plugin');
const Targets = require('wxapp-webpack-plugin').Targets;
const path = require('path');



module.exports = {
	entry: {
        app:path.join(__dirname,'src/app.js')
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	target: Targets.Wechat,
	module: {
		rules: [
			{
				test: /\.(wxss|wxml|json|png)$/,
				loader: 'file-loader',
				options: {
					useRelativePath: true,
					name: '[name].[ext]',
				}
			},
		],
	},
	plugins: [
		new wxAppPlugin({
			// extensions: [`.${ext}`, '.js'],
		}),
	],
	devtool: 'source-map',
	// resolve: {
	// 	modules: [`src/${ext}`, 'node_modules'],
	// 	extensions: ['.js', '.ts', '.json'],
	// },
};