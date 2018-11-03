/**
 * 处理小程序中图片引用的loader,包括wxss js wxml内引用的需要不同的处理流程
 */
const mime = require('mime');
const WechatappPlugin = require('../index');
const packageJson = require('../package.json');
let handler = {

};
function returnResult(...content) {
    return `module.exports = ${JSON.stringify(content)}`;
}
function processFromStyle(context, content){
    // let 
}
module.exports = function (content) {
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
        return '';
    }
    let { option: pluginOption } = pluginInstances;
    let { styleLoaderExt } = pluginOption;
    if(new RegExp(`\\.${styleLoaderExt.join('|')}$`).test(resource)){
        //从样式引用的图片
        return processFromStyle(this,content);
    }
    debugLog('file deps pic ', resource);
    // let {}
    debugLog('before return from loader');
    return returnResult(content.toString('base64'));
    // return content.toString('base64');
};
module.exports.raw = true;