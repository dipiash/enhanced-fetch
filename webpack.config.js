const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

const minimizer = [];
const plugins = [];

if (mode === 'production') {
    minimizer.push(
        new TerserPlugin({
            cache: 'node_modules/.cache/terser-loader/enhanced-fetch-lib',
            parallel: true,
            sourceMap: true,
            extractComments: false,
            terserOptions: {
                ecma: 5,
                output: {
                    comments: false,
                },
            },
        })
    );

    plugins.push(
        new CompressionPlugin(),
    );
}

module.exports = {
    mode,
    plugins,
    entry: {
        main: [
            './src/polyfills.js',
            path.resolve(__dirname, 'src/index.js'),
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'enhancedFetch',
        umdNamedDefine: true,
        libraryTarget: 'umd',
    },
    node: {
        process: false,
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    optimization: {
        minimizer,
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules', path.resolve(__dirname, 'src'),],
    },
    devtool: 'source-map',
};
