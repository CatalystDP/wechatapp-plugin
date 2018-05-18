const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
function fileLoader(ext = '[ext]'){
    return {
        loader: 'file-loader',
        options: {
            useRelativePath: true,
            name: `[name].${ext}`,
        }
    };
}
class WechatAppPlugin {
    /**
     * @constructor 
     * @param {Object} option 
     *    @param {String}[option.devMode=WechatAppPlugin.mode.APP] 开发模式
     *    @param {String} [option.ext='.js']
     *    @param {String} [option.jsonpFuncName='wechatAppJsonp']
     *    @param {String} [option.projectRoot] 自定义工程路径，仅自定义模式下有效
     *    @param {String} [option.customDirs] 自定义入口的目录名称 自定义模式下必传
     */
    constructor(option = {}) {
        this.option = _.defaults(option || {}, {
            devMode: WechatAppPlugin.mode.APP,
            ext:'.js',
            appCommonName: 'appCommon',
            jsonpFuncName: 'wechatAppJsonp',
            pluginCommonName: 'pluginCommon',
            customCommonName:'customCommon',
            pluginExportName:'PLUGIN_EXPORT',
            customFiles:[]
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
    PLUGIN: 'plugin',
    CUSTOM:'custom'
};
const moduleRoute = {
    [WechatAppPlugin.mode.APP]:'AppDevModule',
    [WechatAppPlugin.mode.PLUGIN]:'PluginDevModule',
    [WechatAppPlugin.mode.CUSTOM]:'CustomDevModule'
};
/**
 * @description //包装样式处理，例如使用了less作为样式处理把该函数的返回放到module.rules 的use字段上
 * @param {Object} loaderConfig
 */
WechatAppPlugin.wrapStyleLoaderConfig = function(loaderConfig={}){
    return [
        fileLoader('wxss'),
        loaderConfig
    ];
};
module.exports = WechatAppPlugin;