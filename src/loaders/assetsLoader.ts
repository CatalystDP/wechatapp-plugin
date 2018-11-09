
import { debugLog } from '../tools/debug';
import util from '../lib/util';
import * as _ from 'lodash';
/**
 * 处理小程序中图片引用的loader,包括wxss js wxml内引用的需要不同的处理流程
 */
import mime = require('mime');

import WechatappPlugin = require('../index');
import loaderUtils = require('loader-utils');
import * as path from 'path';
import fileLoader = require('file-loader');
const LOG_TAG = 'assets-loader';
function returnResult(content) {
    return `module.exports = ${JSON.stringify(content)}`;
}
function getDataUri(resource: string, base64Str: string): string {
    if (!resource) return '';
    if (!base64Str) return '';
    let ext = path.extname(resource);
    let type = mime.getType(ext);
    let dataStr = `data:${type};base64,${base64Str}`;
    return dataStr;
}
function convertToAbsolutePath(relativePath: string) {
    return '/' + relativePath.replace(/\.\.\//g, '');
};
function getRelativePath(from: string, to: string) {
    return path.relative(path.dirname(from), to);
}
//从

function processFromStyle(context, content: Buffer, loaderOptions: loaderUtils.OptionObject) {
    // let 
    if (content.byteLength > loaderOptions.limit) {
        if (typeof loaderOptions.publicPath !== 'string' || !/^https\:/.test(loaderOptions.publicPath)) {
            context.emitError(new Error('image size is larger than limit in wxss,cannot convert to base64'));
            return returnResult('');
        } else {
            let { issuer } = context._module;
            if (issuer.resource) {
                let outputPath = `${loaderOptions.publicPath.replace(/\/$/, '')}${convertToAbsolutePath(getRelativePath(issuer.resource, context.resource))}`;
                return returnResult(outputPath);
            }
        }
    }
    let dataStr: string = content.toString('base64');
    let resource: string = context.resource;
    if (typeof resource === 'string') {
        dataStr = getDataUri(resource, dataStr)
    }
    return returnResult(dataStr);
}
function processFromScript(context, content: Buffer, loaderOptions: loaderUtils.OptionObject) {
}
function processFromViews(context, content: Buffer, loaderOptions: loaderUtils.OptionObject) {
    let data: string = '';
    debugLog(LOG_TAG, 'process-from-view', `content size ${content.byteLength} byte limit ${loaderOptions.limit}`);
    if (content.byteLength > loaderOptions.limit) {
        //解析图片相对views 的路径 
        debugLog(LOG_TAG, 'process-from-view', 'using file');
        let { issuer } = context._module;
        if (issuer.resource) {
            let relativeResource = getRelativePath(issuer.resource, context.resource);
            return returnResult(relativeResource);
        }
    }
    debugLog(LOG_TAG, 'process-from-view', 'using base64');
    let dataStr: string = content.toString('base64');
    let resource: string = context.resource;
    if (typeof resource === 'string') {
        dataStr = getDataUri(resource, dataStr)
    }
    return returnResult(dataStr);
}
const loader = function (content: Buffer) {
    debugLog(LOG_TAG, 'main', 'run into loader');
    this.cacheable(false);
    let loaderOptions: loaderUtils.OptionObject = loaderUtils.getOptions(this);
    debugLog(LOG_TAG, 'main', `options = ${JSON.stringify(loaderOptions)}`);
    loaderOptions = _.defaults(loaderOptions, {
        limit: 4 * 1024
    });
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
    debugLog(LOG_TAG, 'main', 'file deps pic ', resource);
    const styleExt = ['wxss']
        .concat(Array.isArray(loaderOptions.styleExt) && loaderOptions.styleExt.length > 0 ? loaderOptions.styleExt : []);
    const scriptExt = ['js']
        .concat(Array.isArray(loaderOptions.scriptExt) &&
            loaderOptions.scriptExt.length > 0 ? loaderOptions.scriptExt : []);
    const viewExt = ['wxml'].concat(Array.isArray(loaderOptions.viewExt) && loaderOptions.viewExt.length > 0 ? loaderOptions.viewExt : []);
    if (typeof resource === 'string') {
        let ext: string = path.extname(resource)
            .replace(/^\./, '');
        if (styleExt.indexOf(ext) > -1) {
            //从样式内引用的图片
            return processFromStyle(this, content, loaderOptions);
        }
        if (scriptExt.indexOf(ext) > -1) {
            return processFromScript(this, content, loaderOptions);
        }
        if (viewExt.indexOf(ext) > -1) {
            return processFromViews(this, content, loaderOptions);
        }
    }
    // if (new RegExp(`\\.${styleLoaderExt.join('|')}$`).test(resource)) {
    //     //从样式引用的图片
    //     return processFromStyle(this, content);
    // }
    // let {}
    // let returnContent = returnResult(content.toString('base64'));
    // return returnContent;
    return content;
    // return content.toString('base64');
};
(<any>loader).raw = true;
export = loader;