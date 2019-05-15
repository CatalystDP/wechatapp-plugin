const webpack = require("webpack");
const path = require("path");
const WechatAppPlugin = require("../dist");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
const glob = require("glob");
let baseConfig = {
    entry: {},
    output: {
        filename: "[name].js"
        // path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            util: path.join(__dirname, "utils")
        },
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            configFile: path.join(__dirname, "tsconfig.json")
                        }
                    }
                ]
            },
            {
                test: /\.(wxss)$/,
                use: WechatAppPlugin.wrapStyleLoaderConfig([], {})
            },
            {
                test: /\.(wxml)$/,
                use: WechatAppPlugin.wrapViewLoaderConfig([], {})
            },
            {
                test: /\.(png|jpeg)$/,
                use: [
                    // WechatAppPlugin.util.fileLoader(),
                    {
                        loader: WechatAppPlugin.loaders.assetsLoader,
                        options: {
                            publicPath: "https://www.testassets.com/assets",
                            limit: 4 * 1024, //限制8k以上不能转base64
                            fallback: "file-loader",
                            fallbackOptions: {
                                name: "[path][name].[ext]"
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(json)$/,
                use: [WechatAppPlugin.util.fileLoader()]
            }
        ]
    },
    devtool: "source-map"
};
module.exports = [
    Object.assign({}, baseConfig, {
        entry: {
            app: path.join(__dirname, "src/miniprogram/app.js")
        },
        output: Object.assign({}, baseConfig.output, {
            path: path.join(__dirname, "dist/miniprogram")
        }),
        module: {},
        plugins: [
            new WechatAppPlugin({
                onAdditionalEntry: function() {
                    console.log("plugin addional entry");
                    return {
                        "external-components/test-component/test-component": path.resolve(
                            __dirname,
                            "../test/src/components/test-component/test-component.ts"
                        )
                    };
                },
                onAdditionalAssets: function() {
                    let assets = glob.sync("**/*.*", {
                        cwd: path.resolve(
                            __dirname,
                            "../test/src/components/test-component/"
                        ),
                        ignore: "**/*.js",
                        realpath: true
                    });
                    return assets;
                },
                onEmitAssets: function(assets = {}) {
                    let keys = Object.keys(assets);
                    let testComponentKey = keys.filter(key => {
                        return (
                            key.indexOf("src/components/test-component") > -1
                        );
                    });
                    testComponentKey.forEach(key => {
                        let newkey = key.replace(
                            /.*(test-component\/.*)/g,
                            "external-components/$1"
                        );
                        console.log(newkey);
                        assets[newkey] = assets[key];
                        delete assets[key];
                    });
                }
            })
        ]
    }),
    Object.assign({}, baseConfig, {
        entry: {
            index: path.join(__dirname, "src/plugin/index.js")
        },
        output: Object.assign({}, baseConfig.output, {
            path: path.join(__dirname, "dist/plugin"),
            devtoolModuleFilenameTemplate:
                "webpack-wechatapp-plugin:///[resource-path]?[loaders]"
        }),
        plugins: [
            new WechatAppPlugin({
                useDefaultLoader: false,
                devMode: WechatAppPlugin.mode.PLUGIN,
                jsonpFuncName: "wechatAppPluginJsonp",
                onAdditionalEntry: function() {
                    console.log("plugin addional entry");
                    return {
                        "external-components/test-component/test-component": path.resolve(
                            __dirname,
                            "../test/src/components/test-component/test-component.ts"
                        )
                    };
                },
                onAdditionalAssets: function() {
                    let assets = glob.sync("**/*.*", {
                        cwd: path.resolve(
                            __dirname,
                            "../test/src/components/test-component/"
                        ),
                        ignore: "**/*.js",
                        realpath: true
                    });
                    return assets;
                },
                onEmitAssets: function(assets = {}) {
                    let keys = Object.keys(assets);
                    let testComponentKey = keys.filter(key => {
                        return (
                            key.indexOf("src/components/test-component") > -1
                        );
                    });
                    testComponentKey.forEach(key => {
                        let newkey = key.replace(
                            /.*(test-component\/.*)/g,
                            "external-components/$1"
                        );
                        console.log(newkey);
                        assets[newkey] = assets[key];
                        delete assets[key];
                    });
                }
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
                reportFilename: "plugin-report.html",
                openAnalyzer: false
            })
        ]
    }),
    Object.assign({}, baseConfig, {
        entry: {
            index: "a"
        },
        output: Object.assign({}, baseConfig.output, {
            path: path.join(__dirname, "dist/custom")
        }),
        module: {},
        plugins: [
            new WechatAppPlugin({
                devMode: WechatAppPlugin.mode.CUSTOM,
                jsonpFuncName: "customJsonp",
                projectRoot: path.join(__dirname, "src/plugin/components"),
                customFiles: ["list/list", "a/list/list"],
                onAdditionalEntry: function() {
                    console.log("custom addional entry");
                    return {
                        "external-components/test-component": path.resolve(
                            __dirname,
                            "../test/src/components/test-component/test-component.ts"
                        )
                    };
                },
                onAdditionalAssets: function() {
                    let assets = glob.sync("**/*.*", {
                        cwd: path.resolve(
                            __dirname,
                            "../test/src/components/test-component/"
                        ),
                        ignore: "**/*.js",
                        realpath: true
                    });
                    return assets;
                },
                onEmitAssets: function(assets = {}) {
                    let keys = Object.keys(assets);
                    let testComponentKey = keys.filter(key => {
                        return (
                            key.indexOf("src/components/test-component") > -1
                        );
                    });
                    testComponentKey.forEach(key => {
                        let newkey = key.replace(
                            /.*(test-component.*)/g,
                            "external-components/$1"
                        );
                        console.log(newkey);
                        assets[newkey] = assets[key];
                        delete assets[key];
                    });
                }
            }),
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
                reportFilename: "custom-component.report.html",
                openAnalyzer: false
            }) //分析包内模块组成
        ]
    })
];
