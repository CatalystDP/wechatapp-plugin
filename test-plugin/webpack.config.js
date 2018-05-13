const webpack = require('webpack');
const path = require('path');
const WechatappPlugin = require('../index');

let baseConfig = {
	entry: {},
	output: {
		filename: '[name].js',
		// path: path.resolve(__dirname, 'dist'),
	},
	resolve:{
		alias:{
			util:path.join(__dirname,'utils')
		}
	},
	devtool:'source-map'
};
module.exports = [
	Object.assign({},baseConfig,{
		entry:{
			app: path.join(__dirname, 'src/miniprogram/app.js'),
		},
		output:Object.assign({},baseConfig.output,{
			path:path.join(__dirname,'dist/miniprogram')
		}),
		plugins:[
			new WechatappPlugin()
		]
	}),
	Object.assign({},baseConfig,{
		entry:{
			index:path.join(__dirname,'src/plugin/index.js')
		},
		output:Object.assign({},baseConfig.output,{
			path:path.join(__dirname,'dist/plugin'),
			devtoolModuleFilenameTemplate: "webpack-wechatapp-plugin:///[resource-path]?[loaders]"
		}),
		plugins:[
			new WechatappPlugin({
				devMode:WechatappPlugin.mode.PLUGIN,
				jsonpFuncName:'wechatAppPluginJsonp'
			})
		]
	})
];
// module.exports = {
// 	entry: {
// 		app: path.join(__dirname, 'src/app.js')
// 	},
// 	resolve: {
// 		alias: {
// 			util: path.join(__dirname, 'utils')
// 		}
// 	},
// 	plugins: [
// 		new WechatappPlugin({
// 			devMode: WechatappPlugin.mode.PLUGIN
// 			// componentsPath:['aaa']
// 		})
// 		// new wxAppPlugin({
// 		// 	// extensions: [`.${ext}`, '.js'],
// 		// }),
// 	],
// 	devtool: 'source-map',
// 	// resolve: {
// 	// 	modules: [`src/${ext}`, 'node_modules'],
// 	// 	extensions: ['.js', '.ts', '.json'],
// 	// },
// };