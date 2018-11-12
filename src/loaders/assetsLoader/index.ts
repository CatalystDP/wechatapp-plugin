import { debugLog } from "../../tools/debug";
import util from '../../lib/util';
import * as _ from 'lodash';
import WechatappPlugin = require('../../index');
import AssetsProcessor from "./AssetsProcessor";
import { LOG_TAG } from "./constants";
import { loader } from "webpack";
let loader = function (
    this: loader.LoaderContext,
    content: Buffer, map: any
) {
    debugLog(LOG_TAG, 'main', 'run into loader');
    this.cacheable(false);
    let packageJson = util.getPackageJson();
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
    new AssetsProcessor(this, content, map);
    return;
};
(<any>loader).raw = true;
export = loader;