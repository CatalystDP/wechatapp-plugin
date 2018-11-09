
import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';
import util from './lib/util';
import IPluginOptions from './interfaces/IPluginOptions';
class WechatAppPlugin {
    public static mode = {
        APP: 'app',
        PLUGIN: 'plugin',
        CUSTOM: 'custom'
    };
    public static wrapStyleLoaderConfig = function (loaders = [], loaderConfig: {
        'extract-loader': any
    } = <any>{}) {
        return [
            util.fileLoader('wxss'),
            // {
            //     loader: 'extract-loader',
            //     options: Object.assign({}, loaderConfig['extract-loader'] || {})
            // },
            // {
            //     loader: 'css-loader',
            //     options: {
            //         import: false
            //     }
            // }
        ].concat(loaders);
    };
    public static wrapViewLoaderConfig = function (loaders = [], loaderConfig: {
        'extract-loader': any,
        'html-loader': any
    } = <any>{}) {
        return [
            WechatAppPlugin.util.fileLoader('wxml'),
            WechatAppPlugin.loaders.extractLoader,
            // {
            //     loader: 'extract-loader',
            //     options: Object.assign({}, loaderConfig['extract-loader'] || {})
            // },
            {
                loader: 'html-loader',
                options: Object.assign({
                    attrs: [
                        'image:src'
                    ]
                }, loaderConfig['html-loader'] || {})
            }
        ].concat(loaders)
    };
    public static loaders = {
        assetsLoader: `${require.resolve('./loaders/assetsLoader')}`,
        extractLoader: require.resolve('./loaders/extractLoader')
    };
    public static util = util;
    private _route: {
        [key: string]: (compiler: any) => void
    };
    protected option: IPluginOptions;
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
     *    @param {Array} [option.picLoaderExt] 需要file-loader处理的文件后缀
     *    @param {Function} [option.onEmitAssets] 当资源要写入文件系统时触发 
     *    @param {Function} [option.onAdditionalAssets ] 额外的资源需要作为入口，需要返回一个数组
     *    @param {Function} [option.onAdditionalEntry] 额外的入口js，需要返回一个对象
     */
    constructor(option: IPluginOptions = {}) {
        this.option = _.defaults(option || {}, {
            devMode: WechatAppPlugin.mode.APP,
            ext: '.js',
            appCommonName: 'appCommon',
            jsonpFuncName: 'wechatAppJsonp',
            pluginCommonName: 'pluginCommon',
            customCommonName: 'customCommon',
            pluginExportName: 'PLUGIN_EXPORT',
            customFiles: [],
            minChunks: null,
            useDefaultLoader: true
        });
        let defaultOpt = {
            componentsPath: ['components'],
            fileLoaderExt: [],
            assetsExt: ['wxml', 'json', 'wxss']
            // picLoaderExt: ['png'],
            // styleLoaderExt: ['wxss']
        };
        _.forIn(defaultOpt, (value, key) => {
            let val: any[];
            if (Array.isArray(value)) {
                //处理选项为数组的情况
                val = (<any[]>value).concat(Array.isArray(this.option[key]) ? this.option[key] : []);
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

    //设置资源
    addLoaders(compiler) {
        let { module } = compiler.options;
        module.rules = module.rules || [];
        module.rules.push({
            test: new RegExp(`\\.(wxss|wxml|json|${this.option.fileLoaderExt.join('|')})$`),
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: '[name].[ext]',
            }
        });//增加file-loader 用来处理非js资源的复制
    }
    // addLoadersUnused(compiler) {
    //     let { module } = compiler.options;
    //     module.rules = module.rules || [];
    //     const resourceMap = {

    //         [`${this.option.styleLoaderExt.join('|')}`]: this.option['onStyleLoaders'],
    //         'wxml': this.option['onTemplateLoaders'],
    //         'json': this.option['onJsonLoaders'],
    //         [`(${this.option.picLoaderExt.join('|')})`]:
    //         {
    //             fn: this.option['onPicLoaders'], config: {
    //                 disableFileLoader: true
    //             }
    //         }
    //     };
    //     if (_.isPlainObject(this.option.moreResourceHandle)) {
    //         _.extend(resourceMap, this.option.moreResourceHandle);
    //     }
    //     console.log('resourceMap ', resourceMap);
    //     _.forIn(resourceMap, (val, key) => {
    //         let use = [];
    //         use.push(util.fileLoader());
    //         if (_.isFunction(resourceMap[key])) {
    //             let loaders = resourceMap[key]();
    //             use = use.concat(_.isArray(loaders) ? loaders : []);
    //         } else if (_.isPlainObject(resourceMap[key])) {
    //             let { fn, config } = resourceMap[key];
    //             if (_.isFunction(fn)) {
    //                 if (_.isPlainObject(config)) {
    //                     if (config.disableFileLoader) {
    //                         use = [];
    //                     }
    //                 }
    //                 let loaders = fn();
    //                 use = use.concat(_.isArray(loaders) ? loaders : []);
    //             }
    //         }
    //         module.rules.push({
    //             test: new RegExp(`\\.${key}$`),
    //             use
    //         });
    //     });
    // }
    createDevModule(compiler, name) {
        let Module = require(path.join(__dirname, 'lib', name)).default;
        new Module(compiler, this.option);
    }
    apply(compiler) {
        compiler.plugin('environment', () => {
            compiler.options && (compiler.options.target = 'web');
        })
        this.option.useDefaultLoader && this.addLoaders(compiler);
        typeof this._route[this.option.devMode] === 'function' && this._route[this.option.devMode](compiler);
        //根据开发模式路由到不同模块
    }
}
const moduleRoute = {
    [WechatAppPlugin.mode.APP]: 'AppDevModule',
    [WechatAppPlugin.mode.PLUGIN]: 'PluginDevModule',
    [WechatAppPlugin.mode.CUSTOM]: 'CustomDevModule'
};
/**
 * @description //包装样式处理，例如使用了less作为样式处理把该函数的返回放到module.rules 的use字段上
 * @param {Object} loaderConfig
 */
export = WechatAppPlugin;