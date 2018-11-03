module.exports = {
    fileLoader(ext = '[ext]') {
        return {
            loader: 'file-loader',
            options: {
                useRelativePath: true,
                name: `[name].${ext}`,
            }
        };
    },
    getPackageJson(){
        return require('../package.json');
    }
};