const webpack = require('webpack');
const path = require('path');
const WechatappPlugin = require('../index');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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
			}),
			new BundleAnalyzerPlugin({
				analyzerMode: 'server',
				analyzerHost: '127.0.0.1',
				analyzerPort: 9999,
				openAnalyzer: false,
			})
		]
	}),
	Object.assign({},baseConfig,{
		entry:{
			index:'a'
		},
		output:Object.assign({},baseConfig.output,{
			path:path.join(__dirname,'dist/custom')
		}),
		plugins:[
			new WechatappPlugin({
				devMode:WechatappPlugin.mode.CUSTOM,
				jsonpFuncName:'customJsonp',
				projectRoot:path.join(__dirname,'src/plugin/components'),
				customFiles:['list/list.js','a/list/list.js']
			}),
		]
	})
];