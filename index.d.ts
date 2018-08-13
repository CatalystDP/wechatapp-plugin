declare type TdevMode = 'app' | 'plugin' | 'custom';
declare type TwebpackMinChunks = (module: object, count: number) => boolean;
declare type TadditionalEntry = {};
interface IPluginCtorOption {
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
    fileLoaderExt?: string[],
    onEmitAssets?: (assets: object) => void
    onAdditionalAssets?: () => string[],
    onAdditionalEntry?: () => TadditionalEntry
};
declare class WechatAppPlugin {
    public constructor(options: IPluginCtorOption);
}
declare namespace WechatAppPlugin {
    export function wrapStyleLoaderConfig(loaderConfig: object): object[]
}