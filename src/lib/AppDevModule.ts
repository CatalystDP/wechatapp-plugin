import BaseDevModule from './BaseDevModule';
import IPluginOptions from '../interfaces/IPluginOptions';
const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');
class AppDevModule extends BaseDevModule {
    protected pages: string[];
    protected appJson: {
        [key: string]: any
    };
    constructor(compiler, pluginOptions: IPluginOptions) {
        super(compiler, pluginOptions);
        this.attachPoint();
    }
    attachPoint() {
        super.attachPoint();
        this.compiler.plugin('environment', () => {
            this.resolveEntry();
            this.appendCommonPlugin(this.pluginOption.appCommonName);
        });
        // this.compiler.plugin('emit',this.wrapGen(this.injectCommon));   
    }
    getProjectRoot() {
        return this.projectRoot || '';
    }
    getCommonName() {
        return this.pluginOption.appCommonName;
    }
    resolveEntry() {
        let { entry } = this.compiler.options;
        if (!_.isObject(entry)) return;
        if (!entry.app) return;
        this.entryResource = [];
        if (!/app\.js/.test(entry.app)) return;
        this.entryResource.push(entry.app);
        this.projectRoot = path.dirname(entry.app);
        this._resolveAppJson();
        this.pages.forEach(page => {
            entry[page] = path.join(this.projectRoot, `${page}${this.pluginOption.ext}`)
        });
        let componentEntry = this.getComponentEntry();
        _.extend(entry, componentEntry);
        _.isFunction(this.pluginOption.onAdditionalEntry) &&
            (_.extend(entry, this.pluginOption.onAdditionalEntry.call(this)));
        _.forIn(entry, val => {
            this.entryResource.push(val);
        })
        this.addAssetsEntry();
    }
    getEntryResource() {
        return this.entryResource;
    }
    _resolveAppJson() {
        let file = path.join(this.projectRoot, 'app.json');
        try {
            this.appJson = fs.readJSONSync(file);
        } catch (e) {
            throw e;
        }
        this.pages = this.appJson['pages'];
        let subPackages = this.appJson['subPackages'];
        if (Array.isArray(subPackages)) {
            subPackages.forEach(sub => {
                if (Array.isArray(sub.pages)) {
                    sub.pages.forEach(page => {
                        this.pages.push(`${sub['root']}/${page}`)
                    });
                }
            });
        }
    }
}
export default AppDevModule;