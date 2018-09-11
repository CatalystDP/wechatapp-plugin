const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const util = require('./lib/util');
class WechatAppPlugin {
    /**
     * @constructor 
     * @param {Object} option 
     *    @param {String}[option.devMode=WechatAppPlugin.mode.APP] 开发模式
     *    @param {String} [option.ext='.js']
     *    @param {String} [option.jsonpFuncName='wechatAppJsonp']
     *    @param {String} [option.projectRoot] 自定义工程路径，仅自定义模式下有效
     *    @param {String} [option.customFiles] 自定义入口的目录名称 自定义模式下必传
     *    @param {Function} [option.minChunks] 传给CommonChunkPlugin 的minChunks参数用于决定抽取到common.js里面模块
     *    @param {Array} [option.componentsPath] 组件的目录，必须是相对路径
     *    @param {Array} [option.fileLoaderExt] 需要file-loader处理的文件后缀
     *    @param {Function} [option.onEmitAssets] 当资源要写入文件系统时触发 
     *    @param {Function} [option.onAdditionalAssets ] 额外的资源需要作为入口，需要返回一个数组
     *    @param {Function} [option.onAdditionalEntry] 额外的入口js，需要返回一个对象
     */
    constructor(option = {}) {
        this.option = _.defaults(option || {}, {
            devMode: WechatAppPlugin.mode.APP,
            ext: '.js',
            appCommonName: 'appCommon',
            jsonpFuncName: 'wechatAppJsonp',
            pluginCommonName: 'pluginCommon',
            customCommonName: 'customCommon',
            pluginExportName: 'PLUGIN_EXPORT',
            customFiles: [],
            minChunks: null
        });
        let defaultOpt = {
            componentsPath: ['components'],
            fileLoaderExt: ['png'],
        };
        _.forIn(defaultOpt, (value, key) => {
            let val;
            if (Array.isArray(value)) {
                //处理选项为数组的情况
                val = value.concat(Array.isArray(this.option[key]) ? this.option[key] : []);
            }
            this.option[key] = val;
        });
        this._route = {};
        _.forIn(moduleRoute, (value, key) => {
            this._route[key] = (compiler) => {
                this.createDevModule(compiler, value);
            }
        });
    }
    addLoaders(compiler) {
        let { module } = compiler.options;
        module.rules = module.rules || [];
        module.rules.push({
            test: new RegExp(`\\.(wxss|wxml|json|${this.pluginOption.fileLoaderExt.join('|')})`),
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: '[name].[ext]',
            }
        });//增加file-loader 用来处理非js资源的复制
    }
    createDevModule(compiler, name) {
        let Module = require(path.join(__dirname, 'lib', name));
        new Module(compiler, this.option);
    }
    apply(compiler) {
        compiler.plugin('environment', () => {
            compiler.options && (compiler.options.target = 'web');
        })
        this.addLoaders(compiler);
        typeof this._route[this.option.devMode] === 'function' && this._route[this.option.devMode](compiler);
        //根据开发模式路由到不同模块
    }
}
WechatAppPlugin.mode = {
    APP: 'app',
    PLUGIN: 'plugin',
    CUSTOM: 'custom'
};
const moduleRoute = {
    [WechatAppPlugin.mode.APP]: 'AppDevModule',
    [WechatAppPlugin.mode.PLUGIN]: 'PluginDevModule',
    [WechatAppPlugin.mode.CUSTOM]: 'CustomDevModule'
};
/**
 * @description //包装样式处理，例如使用了less作为样式处理把该函数的返回放到module.rules 的use字段上
 * @param {Object} loaderConfig
 */
WechatAppPlugin.wrapStyleLoaderConfig = function (loaderConfig = []) {
    return [
        util.fileLoader('wxss')
    ].concat(loaderConfig);
};
WechatAppPlugin.fileLoader = util.fileLoader;
module.exports = WechatAppPlugin;