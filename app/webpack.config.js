const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: './src/index.js',
    plugins: [
        new VueLoaderPlugin(),
        new webpack.IgnorePlugin(new RegExp("^(fs|ipc)$"))
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            // this will apply to both plain `.css` files
            // AND `<style>` blocks in `.vue` files
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
            ]
            },
            {
                test: /\.ttf$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 50000,
                    },
                },
            },
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: ""
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        watchOptions: {
            poll: false
        },
        publicPath: 'http://localhost:8080/'
    }
};
