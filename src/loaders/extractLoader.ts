import * as vm from "vm";
import * as path from "path";
import * as url from "url";
import { getOptions } from "loader-utils";
import * as resolve from "resolve";
import * as btoa from "btoa";
import { debugLog } from "../tools/debug";
const LOG_TAG = "extractLoader";
/**
 * @typedef {Object} LoaderContext
 * @property {function} cacheable
 * @property {function} async
 * @property {function} addDependency
 * @property {function} loadModule
 * @property {string} resourcePath
 * @property {object} options
 */

/**
 * Executes the given module's src in a fake context in order to get the resulting string.
 *
 * @this LoaderContext
 * @param {string} src
 * @throws Error
 */
async function extractLoader(src) {
    debugLog(
        LOG_TAG,
        "main",
        "using no cacheable extract loader - filename: ",
        this.resourcePath
    );
    this.cacheable();
    const done = this.async();
    const options = getOptions(this) || {};
    const publicPath = getPublicPath(options, this);

    try {
        done(
            null,
            await evalDependencyGraph({
                loaderContext: this,
                src,
                filename: this.resourcePath,
                publicPath
            })
        );
    } catch (error) {
        done(error);
    }
}

function evalDependencyGraph({
    loaderContext,
    src,
    filename,
    publicPath = ""
}) {
    const moduleCache = new Map();

    function loadModule(filename) {
        return new Promise((resolve, reject) => {
            // loaderContext.loadModule automatically calls loaderContext.addDependency for all requested modules
            loaderContext.loadModule(filename, (error, src) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(src);
                }
            });
        });
    }

    function extractExports(exports) {
        const hasBtoa = "btoa" in global;
        const previousBtoa = (<any>global).btoa;

        (<any>global).btoa = btoa;

        try {
            return exports.toString();
        } catch (error) {
            throw error;
        } finally {
            if (hasBtoa) {
                (<any>global).btoa = previousBtoa;
            } else {
                delete (<any>global).btoa;
            }
        }
    }

    async function evalModule(src, filename) {
        const rndPlaceholder =
            "__EXTRACT_LOADER_PLACEHOLDER__" + rndNumber() + rndNumber();
        const rndPlaceholderPattern = new RegExp(rndPlaceholder, "g");
        const script = new vm.Script(src, {
            filename,
            displayErrors: true
        });
        const newDependencies = [];
        const exports = {};
        const sandbox = Object.assign({}, global, {
            module: {
                exports
            },
            exports,
            __webpack_public_path__: publicPath, // eslint-disable-line camelcase
            require: givenRelativePath => {
                let indexOfQuery = givenRelativePath.indexOf("?");
                if (indexOfQuery == -1) {
                    indexOfQuery = givenRelativePath.length;
                }
                // Math.max(givenRelativePath.indexOf("?"), givenRelativePath.length);
                const relativePathWithoutQuery = givenRelativePath.slice(
                    0,
                    indexOfQuery
                );
                const indexOfLastExclMark = relativePathWithoutQuery.lastIndexOf(
                    "!"
                );
                let query = givenRelativePath.slice(indexOfQuery);
                const loaders = givenRelativePath.slice(
                    0,
                    indexOfLastExclMark + 1
                );
                const relativePath = relativePathWithoutQuery.slice(
                    indexOfLastExclMark + 1
                );
                const absolutePath = resolve.sync(relativePath, {
                    basedir: path.dirname(filename)
                });
                const ext = path.extname(absolutePath);

                if (moduleCache.has(absolutePath)) {
                    return moduleCache.get(absolutePath);
                }

                // If the required file is a js file, we just require it with node's require.
                // If the required file should be processed by a loader we do not touch it (even if it is a .js file).
                if (loaders === "" && ext === ".js") {
                    // Mark the file as dependency so webpack's watcher is working for the css-loader helper.
                    // Other dependencies are automatically added by loadModule() below
                    loaderContext.addDependency(absolutePath);

                    const exports = require(absolutePath); // eslint-disable-line import/no-dynamic-require

                    moduleCache.set(absolutePath, exports);

                    return exports;
                }
                // let t = rndNumber() + rndNumber();
                let absoluteRequest = loaders + absolutePath;
                let querySearchParams = new url.URLSearchParams(query);
                let newSearchParams = {};
                querySearchParams.forEach((val, key) => {
                    newSearchParams[key] = val;
                });
                Object.assign(newSearchParams, {
                    t: rndPlaceholder
                });
                newDependencies.push({
                    absolutePath,
                    absoluteRequest:
                        loaders +
                        absolutePath +
                        "?" +
                        new url.URLSearchParams(newSearchParams).toString()
                });

                return rndPlaceholder;
            }
        });

        script.runInNewContext(sandbox);
        const extractedDependencyContent = await Promise.all(
            newDependencies.map(async ({ absolutePath, absoluteRequest }) => {
                const src = await loadModule(absoluteRequest);
                // const src = await loadModule(relativeRequest);
                return evalModule(src, absolutePath);
            })
        );
        const contentWithPlaceholders = extractExports(sandbox.module.exports);
        const extractedContent = contentWithPlaceholders.replace(
            rndPlaceholderPattern,
            () => extractedDependencyContent.shift()
        );
        moduleCache.set(filename, extractedContent);

        return extractedContent;
    }

    return evalModule(src, filename);
}

/**
 * @returns {string}
 */
function rndNumber() {
    return Math.random()
        .toString()
        .slice(2);
}

/**
 * Retrieves the public path from the loader options, context.options (webpack <4) or context._compilation (webpack 4+).
 * context._compilation is likely to get removed in a future release, so this whole function should be removed then.
 * See: https://github.com/peerigon/extract-loader/issues/35
 *
 * @deprecated
 * @param {Object} options - Extract-loader options
 * @param {Object} context - Webpack loader context
 * @returns {string}
 */
function getPublicPath(options, context) {
    if ("publicPath" in options) {
        return options.publicPath;
    }

    if (
        context.options &&
        context.options.output &&
        "publicPath" in context.options.output
    ) {
        return context.options.output.publicPath;
    }

    if (
        context._compilation &&
        context._compilation.outputOptions &&
        "publicPath" in context._compilation.outputOptions
    ) {
        return context._compilation.outputOptions.publicPath;
    }

    return "";
}

export = extractLoader;
