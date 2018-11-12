const co = require('co');
import path = require('path');
import webpack = require('webpack');
import IPluginOptions from '../interfaces/IPluginOptions';
import * as globToRegexp from 'glob-to-regexp';
import { debugLog } from '../tools/debug';
const { ConcatSource, RawSource } = require('webpack-sources');

const acorn = require('acorn');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const unixfy = require('unixify');
const chalk = require('chalk');
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const assetsName = 'assets';
const LOG_TAG='BaseDevModule';
class BaseDevModule {
    protected compiler: any;
    protected pluginOption: IPluginOptions;
    protected distPath: string;
    protected globalVar: string;
    protected projectRoot: string;
    protected entryResource: string[];
    constructor(compiler, pluginOption: IPluginOptions) {
        this.compiler = compiler;
        this.pluginOption = pluginOption;
        this.distPath = compiler.options.output.path;
        this.globalVar = 'wx';//微信小程序的全局变量
    }
    attachPoint() {
        this.compiler.plugin('compilation', (compilation, params) => {
            this.attachTemplatePlugin(compilation, params);
            this.onCompilation(compilation, params);
        });
        this.compiler.plugin('emit', this.wrapGen(function* (compilation, cb) {
            //清除掉assets.js相关文件         
            try {
                Object.keys(compilation.assets).filter(key => {
                    // return key.indexOf(`${assetsName}${this.pluginOption.ext}`) > -1
                    return key.indexOf(`${assetsName}.js`) > -1
                }).forEach(key => {
                    delete compilation.assets[key];
                });
                Object.keys(compilation.assets).filter(key => {
                    return /^(\.\.\/)/.test(key);//匹配有相对路径开头的key
                }).forEach(key => {
                    compilation.assets[key.replace(/\.\.\//g, '')] = compilation.assets[key];
                    delete compilation.assets[key];//去掉有相对路径开头的key保证key都是相对与输出目录的
                });
                _.isFunction(this.pluginOption.onEmitAssets) && this.pluginOption.onEmitAssets.call(this, compilation.assets);
                yield this.emitAssets(compilation);
                cb();
            } catch (e) {
                console.error(chalk.red(`[Error] emit assets Error: ${e},trace: ${e.stack}`));
            }
        }));
    }
    *emitAssets(compilation) { }
    onCompilation(compilation, params) {

    }
    getProjectRoot() {
        return '';
    }
    /**
     * @return {Object} 返回一个组件的map 记录了entryname 与组件位置的映射关系
     */
    getComponentEntry() {
        let entry = {};
        this.pluginOption.componentsPath.forEach(dir => {
            let component = glob.sync(`${dir}/**/*${this.pluginOption.ext}`, {
                cwd: this.getProjectRoot()
            });
            if (Array.isArray(component)) {
                component.forEach(c => {
                    let fullPath = path.join(this.getProjectRoot(), c);
                    let pathInfo = path.parse(c);
                    if (pathInfo.dir.indexOf(pathInfo.name) == -1) return;//组件文件的文件名不和目录名字匹配，认为当前文件不是组件，不要加入到entry
                    let jsonPath = fullPath.replace(path.extname(fullPath), '.json');
                    if (!fs.existsSync(jsonPath)) return;//没有组件的json文件，认为不是组件
                    entry[c.replace(path.extname(c), '')] = path.join(this.getProjectRoot(), c);
                });
            }
        });
        return entry;
    }
    //设置资源
    addAssetsEntry(assets = []) {
        let entry = {};
        let globStr = `**/*.*(${this.pluginOption.assetsExt.join('|')})`;
        let extraAssets = glob.
            sync(globStr, {
                // ignore: `**/*${this.pluginOption.ext}`,
                cwd: this.getProjectRoot(),
                realpath: true
            });
        if (Array.isArray(assets) && assets.length > 0) {
            extraAssets = extraAssets.concat(assets);
        }
        _.isFunction(this.pluginOption.onAdditionalAssets) &&
            (extraAssets = extraAssets.concat(this.pluginOption.onAdditionalAssets.call(this)));
        // extraAssets = extraAssets.filter((file) => {
        //     return !new RegExp(`\\.${this.pluginOption.picLoaderExt.join('|')}$`).test(file);
        // });
        this.compiler.apply(new MultiEntryPlugin(this.getProjectRoot(), extraAssets, assetsName));
    }
    *appendAsset(compilation) {
        //TODO:暂时没有用
        let { assets } = compilation;
        let extraAssets = glob.sync('**/*.!(js)', {
            cwd: this.getProjectRoot()
        });
        if (Array.isArray(extraAssets)) {
            yield extraAssets.map(name => {
                return function* () {
                    try {
                        assets[name] = new RawSource(yield fs.readFile(path.join(this.getProjectRoot(), name), 'utf-8'));
                    } catch (e) {
                    }
                }.bind(this);
            });
        }
    }
    wrapGen(func) {
        if (typeof func !== 'function') return function (...args) {
            return Promise.reject('not a function');
        };
        func = func.bind(this);
        if (func.constructor.name !== 'GeneratorFunction') return function (...args) {
            return new Promise(resolve => {
                resolve(func(...args));
            }).catch(e => {
                console.error(chalk.red(`[Error] wrapGen ${e}`));
            });
        }
        return co.wrap(func);
    }
    appendCommonPlugin(name) {
        //提取出common chunk 
        const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
        let regexp = globToRegexp(`*${this.pluginOption.ext}`, {
            extended: true,
            globstar:true
        });
        // debugLog(LOG_TAG,'appendCommonPlugin',`regexp = ${regexp }`);
        let minChunks = _.isFunction(this.pluginOption.minChunks) ? this.pluginOption.minChunks : (module, count) => {
            // if (module.resource && path.parse(module.resource).ext == this.pluginOption.ext) {
            //     return this.getEntryResource().indexOf(module.resource) == -1;
            // }
            return count >= 2;
        };
        this.compiler.apply(new CommonsChunkPlugin({
            name,
            minChunks
        }));
    }
    getCommonRelativePath(commonName, targetFile) {
        let commonPath = path.join(this.distPath, `${commonName}.js`);
        let relativePath = unixfy(path.relative(path.dirname(targetFile), commonPath));
        return relativePath
    }
    getCommonName() {
        return '';
    }
    /**
     * @description 获取真正的小程序的入口
     */
    getEntryResource() {
        return [];
    }
    attachTemplatePlugin(compilation, params) {
        //修改生成的模版内容
        let jsonpFuncName = JSON.stringify(this.pluginOption.jsonpFuncName);
        compilation.chunkTemplate.plugin('render', (core, { name }) => {
            let source = core;
            let injectFunction = `
function webpackJsonp(){
    require(${JSON.stringify(this.getCommonRelativePath(this.getCommonName(), path.join(this.distPath, `${name}.js`)))});
    typeof wx[${jsonpFuncName}] === 'function' && wx[${jsonpFuncName}].apply(wx,arguments);
}
`;

            let concatSource = new ConcatSource(injectFunction);
            concatSource.add(source);
            // return source;
            return concatSource;
        });
        compilation.mainTemplate.plugin('bootstrap', (core, { name }) => {
            //修改运行时
            let source = core;
            if (name === this.getCommonName()) {
                let arr = [];
                acorn.parse(source, {
                    onToken: (token) => {
                        if (['window', 'webpackJsonp'].indexOf(token.value) > -1) {
                            arr.push(token);
                        }
                    }
                })
                let lastEnd = 0;
                let result = [];
                arr.forEach(token => {
                    result.push(source.substring(lastEnd, token.start));
                    if (token.value === 'window') {
                        result.push(this.globalVar);
                    } else if (token.value == 'webpackJsonp') {
                        result.push(jsonpFuncName);
                    }
                    lastEnd = token.end;
                });
                result.push(source.substr(lastEnd, source.length));
                source = result.join('');
            }
            return source;
        });
    }
}
export default BaseDevModule;
