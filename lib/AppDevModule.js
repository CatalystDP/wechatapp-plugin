const BaseDevModule = require('./BaseDevModule');
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');
class AppDevModule extends BaseDevModule{
    constructor(...args){
        super(...args);
        this.attachPoint();
    }
    attachPoint(){
        super.attachPoint();
        this.compiler.plugin('environment',()=>{
            this.resolveEntry();
            this.appendCommonPlugin(this.pluginOption.appCommonName);
        });
        // this.compiler.plugin('emit',this.wrapGen(this.injectCommon));   
    }
    getProjectRoot(){
        return this.projectRoot || '';
    }
    getCommonName(){
        return this.pluginOption.appCommonName;
    }
    resolveEntry(){
        let {entry} = this.compiler.options;
        if(!_.isObject(entry)) return;
        if(!entry.app) return;
        if(!/app\.js/.test(entry.app)) return;
        this.projectRoot = path.dirname(entry.app);
        this._resolveAppJson(); 
        this.pages.forEach(page=>{
            entry[page] = path.join(this.projectRoot,`${page}${this.pluginOption.ext}`)
        });
        _.extend(entry,this.getComponentEntry());
        this.addAssetsEntry();
    }
    _resolveAppJson(){
        let file = path.join(this.projectRoot,'app.json');
        try{
            this.appJson = fs.readJSONSync(file);
        }catch(e){
            throw e;
        }
        this.pages = this.appJson['pages'];
        let subPackages = this.appJson['subPackages'];
        if(Array.isArray(subPackages)){
            subPackages.forEach(sub=>{
                if(Array.isArray(sub.pages)){
                    sub.pages.forEach(page=>{
                        this.pages.push(`${sub['root']}/${page}`)  
                    });
                }
            });
        }
    } 
}
module.exports = AppDevModule;