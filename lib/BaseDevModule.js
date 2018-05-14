const co = require('co');
const webpack = require('webpack');
const path = require('path');
const { ConcatSource, RawSource } = require('webpack-sources');
const acorn = require('acorn');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const assetsName = 'assets';
class BaseDevModule {
    constructor(compiler, pluginOption = {}) {
        this.compiler = compiler;
        this.pluginOption = pluginOption;
        this.distPath = compiler.options.output.path;
        this.globalVar = 'wx';//微信小程序的全局变量
    }
    attachPoint() {
        this.compiler.plugin('compilation',(compilation,params)=>{
            this.attachTemplatePlugin(compilation,params);
            this.onCompilation(compilation,params);
        });
        this.addLoaders();
        this.compiler.plugin('emit', this.wrapGen(function* (compilation, cb) {
            //清除掉assets.js相关文件         
            Object.keys(compilation.assets).filter(key => {
                return key.indexOf(`${assetsName}${this.pluginOption.ext}`) > -1
            }).forEach(key => {
                delete compilation.assets[key];
            });
            yield this.emitAssets(compilation);
            cb();
        }));
    }
    *emitAssets(compilation){}
    onCompilation(compilation,params){

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
                    let fullPath = path.join(this.getProjectRoot(),c);
                    let pathInfo = path.parse(c);
                    if(pathInfo.dir.indexOf(pathInfo.name)==-1) return;//组件文件的文件名不和目录名字匹配，认为当前文件不是组件，不要加入到entry
                    entry[c.replace(this.pluginOption.ext, '')] = path.join(this.getProjectRoot(), c);
                });
            }
        });
        return entry;
    }
    //设置资源
    addLoaders() {
        let { module } = this.compiler.options;
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
    addAssetsEntry(assets=[]) {
        let entry = {};
        let extraAssets = glob.sync(`**/*.*`, {
            ignore: `**/*${this.pluginOption.ext}`,
            cwd: this.getProjectRoot(),
            realpath: true
        });
        if(Array.isArray(assets) && assets.length > 0){
            extraAssets = extraAssets.concat(assets);  
        }
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
            });
        }
        return co.wrap(func);
    }
    appendCommonPlugin(name) {
        //提取出common chunk 
        const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
        this.compiler.apply(new CommonsChunkPlugin({
            name,
            minChunks: 2
        }));
    }
    getCommonRelativePath(commonName, targetFile) {
        let commonPath = path.join(this.distPath, `${commonName}${this.pluginOption.ext}`);
        let relativePath = path.relative(path.dirname(targetFile), commonPath);
        // if(['app.js'].some(n=>{
        //     return targetFile.indexOf(n)>-1;
        // })){
        //     relativePath = './'+relativePath;
        // }
        return relativePath
    }
    getCommonName() {
        return '';
    }
    attachTemplatePlugin(compilation, params) {
        //修改生成的模版内容
        let jsonpFuncName = JSON.stringify(this.pluginOption.jsonpFuncName);
        compilation.chunkTemplate.plugin('render', (core, { name }) => {
            let source = core;
            let injectFunction = `
function webpackJsonp(){
    require(${JSON.stringify(this.getCommonRelativePath(this.getCommonName(), path.join(this.distPath, `${name}${this.pluginOption.ext}`)))});
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
                // console.log(arr);
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
module.exports = BaseDevModule;
