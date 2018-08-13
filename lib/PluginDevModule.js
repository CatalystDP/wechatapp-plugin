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
        let { entry } = this.compiler.options;
        if (!_.isObject(entry)) throw new Error('entry config must an Object');
        if (!entry.index) throw new Error('entry name must be "plugin"');
        this.entryResource = [entry.index];
        this.projectRoot = path.dirname(entry.index);
        let componentEntry = this.getComponentEntry();
        _.extend(entry, componentEntry);
        this.addAssetsEntry();
        _.isFunction(this.pluginOption.onAdditionalEntry) &&
            (_.extend(entry, this.pluginOption.onAdditionalEntry.call(this)));
        _.forIn(entry, val => {
            this.entryResource.push(val);
        })
    }
    getEntryResource() {
        return this.entryResource;
    }
    resolveProjectConfigJson() {
        let parentPathToPlugin = path.dirname(this.projectRoot);
        let projectConfig = fs.readJSONSync(path.join(parentPathToPlugin, 'project.config.json'));
        let { miniprogramRoot, pluginRoot } = projectConfig;
        // miniprogramRoot = miniprogramRoot.replace(//);
        let ignorePath = [path.parse(miniprogramRoot).name, path.parse(pluginRoot).name];
        let parentAssets = glob.sync('**/*.*', {
            cwd: parentPathToPlugin,
            // ignore: `**/*${this.pluginOption.ext}`,
            ignore: [`+(${ignorePath.join('|')})/**/*.*`],
            // realpath: true
        });
        let { output: { path: outputPath } } = this.compiler.options;
        outputPath = path.dirname(outputPath);
        return parentAssets.map(asset => {
            return function* () {
                yield fs.copy(path.join(parentPathToPlugin, asset), path.join(outputPath, asset));
            }
        });
    }
    *emitAssets(compilation) {
        yield this.resolveProjectConfigJson();
        this.injectPluginEntry(compilation);
    }
    injectPluginEntry(compilation) {
        let { assets } = compilation;
        let key = 'index.js';//插件入口的key
        let pluginMainFile = assets[key];
        if (!pluginMainFile) return;
        let concatSource = new ConcatSource(`var ${this.pluginOption.pluginExportName};`);
        concatSource.add(pluginMainFile);
        concatSource.add(`\nmodule.exports = ${this.pluginOption.pluginExportName};`);
        assets[key] = concatSource;
    }
    getProjectRoot() {
        return this.projectRoot || '';
    }
    getCommonName() {
        return this.pluginOption.pluginCommonName;
    }
}
module.exports = PluginDevModule;