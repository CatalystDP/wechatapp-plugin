
import { debugLog } from '../tools/debug';
import util from '../lib/util';
/**
 * 处理小程序中图片引用的loader,包括wxss js wxml内引用的需要不同的处理流程
 */
import mime = require('mime');
const WechatappPlugin = require('../index');
import loaderUtils = require('loader-utils');
import * as path from 'path';
import fileLoader = require('file-loader');
function returnResult(...content) {
    return `module.exports = ${JSON.stringify(content)}`;
}
//从
function processFromStyle(context, content: Buffer) {
    // let 
    let dataStr: string = content.toString('base64');
    let resource: string = context.resource;
    if (typeof resource === 'string') {
        let ext = path.extname(resource);
        let type = mime.getType(ext);
        dataStr = `data:${type};base64,${dataStr}`;
    }
    return returnResult(dataStr);
}
function processFromScript(context, content: Buffer) {

}
const LOG_TAG = 'pic-loader';
const loader = function (content: Buffer) {
    let packageJson = util.getPackageJson();
    let { issuer } = this._module,
        { resource } = issuer;
    let { plugins } = this.options;
    let pluginInstances;
    if (Array.isArray(plugins)) {
        pluginInstances = plugins.filter(plugin => {
            return plugin instanceof WechatappPlugin;
        })[0];
    }
    if (!pluginInstances) {
        let error = new Error(`can not find ${packageJson.name} instance`);
        this.emitError(error);
        throw error;
    }
    const loaderOptions: loaderUtils.OptionObject =
        loaderUtils.getOptions(this);
    debugLog(LOG_TAG, 'file deps pic ', resource);
    const styleExt = ['wxss']
        .concat(Array.isArray(loaderOptions.styleExt) && loaderOptions.styleExt.length > 0 ? loaderOptions.styleExt : []);
    const scriptExt = ['js']
        .concat(Array.isArray(loaderOptions.scriptExt) &&
            loaderOptions.scriptExt.length > 0 ? loaderOptions.scriptExt : []);
    if (typeof resource === 'string') {
        let ext: string = path.extname(resource)
            .replace(/^\./, '');
        if (styleExt.indexOf(ext) > -1) {
            //从样式内引用的图片
            return processFromStyle(this, content);
        }
        if (scriptExt.indexOf(ext) > -1) {

        }
    }
    // if (new RegExp(`\\.${styleLoaderExt.join('|')}$`).test(resource)) {
    //     //从样式引用的图片
    //     return processFromStyle(this, content);
    // }
    // let {}
    let returnContent = returnResult(content.toString('base64'));
    return returnContent;
    // return content;
    // return content.toString('base64');
};
(<any>loader).raw = true;
export = loader;