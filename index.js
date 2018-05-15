const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
class WechatAppPlugin {
    /**
     * @constructor 
     * @param {Object} option 
     *    @param {String}[option.devMode=WechatAppPlugin.mode.APP] 开发模式
     *    @param {String} [option.ext='.js']
     *    @param {String} [option.jsonpFuncName='wechatAppJsonp']
     *        
     */
    constructor(option = {}) {
        this.option = _.defaults(option || {}, {
            devMode: WechatAppPlugin.mode.APP,
            ext:'.js',
            appCommonName: 'appCommon',
            jsonpFuncName: 'wechatAppJsonp',
            pluginCommonName: 'pluginCommon',
            pluginExportName:'PLUGIN_EXPORT',
        });
        let defaultOpt = {
            componentsPath:['components'],
            fileLoaderExt:['png'],
        };
        _.forIn(defaultOpt,(value,key)=>{
            let val;
            if(Array.isArray(value)){
                //处理选项为数组的情况
                val = value.concat(Array.isArray(this.option[key])? this.option[key]:[]);
            }
            this.option[key] = val;
        });
        this._route = {};
        _.forIn(moduleRoute,(value,key)=>{
            this._route[key] = (compiler)=>{
                this.createDevModule(compiler,value);
            }
        });
    }
    createDevModule(compiler,name){
        let Module = require(path.join(__dirname,'lib',name));
        new Module(compiler,this.option);
    }
    apply(compiler) {
        compiler.plugin('environment', () => {
            compiler.options && (compiler.options.target = 'web');
        })
        typeof this._route[this.option.devMode] === 'function' && this._route[this.option.devMode](compiler);
        //根据开发模式路由到不同模块
    }
}
WechatAppPlugin.mode = {
    APP: 'app',
    PLUGIN: 'plugin'
};
const moduleRoute = {
    [WechatAppPlugin.mode.APP]:'AppDevModule',
    [WechatAppPlugin.mode.PLUGIN]:'PluginDevModule'
};
/**
 * @description //包装样式处理，例如使用了less作为样式处理把该函数的返回放到module.rules 的use字段上
 * @param {Object} loaderConfig
 */
function fileLoader(ext = '[ext]'){
    return {
        loader: 'file-loader',
        options: {
            useRelativePath: true,
            name: `[name].${ext}`,
        }
    };
}
WechatAppPlugin.wrapStyleLoaderConfig = function(loaderConfig={}){
    return [
        fileLoader('wxss'),
        loaderConfig
    ];
};
module.exports = WechatAppPlugin;