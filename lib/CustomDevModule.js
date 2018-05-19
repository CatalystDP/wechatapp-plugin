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
        if (!_.isObject(this.compiler.options.entry)) throw new Error('entry must be an Object');
        let entry = this.compiler.options.entry;
        Object.keys(entry).forEach(key => {
            delete entry[key];
        });
        this.entryResource = [];
        this.projectRoot = this.pluginOption.projectRoot;
        let customEntry = this.getCustomEntry();
        _.forIn(customEntry, val => {
            this.entryResource.push(val);
        });
        _.extend(entry, customEntry);
        this.addAssetsEntry();
    }
    getEntryResource(){
        return this.entryResource;
    }
    getCustomEntry() {
        let entry = {};
        let customEntrys = glob.sync(`**/*${this.pluginOption.ext}`, {
            cwd: this.getProjectRoot()
        });
        if (Array.isArray(customEntrys)) {
            customEntrys.filter(file => {
                return this.pluginOption.customFiles.some(f => {
                    return file.indexOf(f) > -1;
                })
            }).forEach(e => {
                let fullPath = path.join(this.getProjectRoot(), e);
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