
const log = require('debug')('wechatapp-plugin');
export const debugLog = (tag: string, ...args: string[]) => {
    log(`[${tag}] - `, ...args);
};