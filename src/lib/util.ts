import * as path from 'path';
export default {
    fileLoader(ext = '[ext]') {
        return {
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: `[name].${ext}`,
            }
        };
    },
    getPackageJson() {
        return require('../../package.json');
    }
};