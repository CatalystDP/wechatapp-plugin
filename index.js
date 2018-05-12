const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
class WechatAppPlugin {
    constructor(option = {}) {
        this.option = _.defaults(option || {}, {
            devMode: WechatAppPlugin.mode.APP,
            ext:'.js',
            appCommonName: 'appCommon',
            jsonpFuncName: 'wechatAppJsonp',
            pluginCommonName: 'pluginCommon'
        });
        let defaultOpt = {
            componentsPath:['components'],
        };
        _.forIn(defaultOpt,(value,key)=>{
            let val;
            if(Array.isArray(value)){
                //处理选项为数组的情况
                val = value.concat(Array.isArray(this.option[key])? this.option[key]:[]);
            }
            this.option[key] = val;
        });
        this.option
        this._route = {
            [WechatAppPlugin.mode.APP]: (compiler) => {
                let Module = require('./lib/AppDevModule');
                new Module(compiler, this.option);
            },
            [WechatAppPlugin.mode.PLUGIN]: (compiler, ) => {

            }
        };
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
module.exports = WechatAppPlugin;