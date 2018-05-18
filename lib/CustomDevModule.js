const BaseDevModule = require('./BaseDevModule');
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');
const acorn = require('acorn');
const { ConcatSource } = require('webpack-sources');
class PluginDevModule extends BaseDevModule {
    constructor(...args) {
        super(...args);
        this.attachPoint();
    }
    attachPoint() {
        super.attachPoint();
        this.compiler.plugin('environment', () => {
            this.resolveEntry();
            this.appendCommonPlugin(this.getCommonName());
        });
    }
    resolveEntry() {
        let entry = this.compiler.options.entry = {};
        this.projectRoot = this.pluginOption.projectRoot;
        _.extend(entry,this.getCustomEntry());
        this.addAssetsEntry();
    }
    getCustomEntry(){
        let entry = {};
        let customEntrys = glob.sync(`**/*${this.pluginOption.ext}`, {
            cwd: this.getProjectRoot()
        });
        if (Array.isArray(customEntrys)) {
            customEntrys.filter(file=>{
                return this.pluginOption.customFiles.some(f=>{
                    return file.indexOf(f)>-1;
                })
            }).forEach(e => {
                let fullPath = path.join(this.getProjectRoot(),e);
                entry[e.replace(this.pluginOption.ext, '')] = path.join(this.getProjectRoot(), e);
            });
        }
        return entry;
    }
    *emitAssets(compilation) {
    }
    getProjectRoot() {
        return this.projectRoot || '';
    }
    getCommonName() {
        return this.pluginOption.customCommonName;
    }
}
module.exports = PluginDevModule;