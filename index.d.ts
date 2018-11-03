export type TdevMode = 'app' | 'plugin' | 'custom';
export type TwebpackMinChunks = (module: object, count: number) => boolean;
export type TadditionalEntry = {};
export interface IPluginCtorOption {
    /**
     *
     *
     * @type {TdevMode}
     * @memberof IPluginCtorOption
     * 开发模式 只能为app | plugin | custom
     */
    devMode?: TdevMode,
    ext: '.js',
    appCommonName?: string,
    jsonpFuncName?: string,
    pluginCommonName?: string,
    customCommonName?: string,
    pluginExportName?: string,
    customFiles?: string[],
    minChunks?: null | TwebpackMinChunks,
    componentsPath?: string[],
    picLoaderExt?: string[],
    onEmitAssets?: (assets: object) => void
    onAdditionalAssets?: () => string[],
    onAdditionalEntry?: () => TadditionalEntry
};
class WechatAppPlugin {
    public constructor(options: IPluginCtorOption);
}
namespace WechatAppPlugin {
    export function wrapStyleLoaderConfig(loaderConfig: object): object[]
}
export = WechatAppPlugin;