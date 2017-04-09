'use strict';

const webpack           = require('webpack');
const path              = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appconfig = require('./app.config');


module.exports = {
    debug: true,
    devtool: 'inline-source-map',
    noInfo: false,
    entry: [
        'eventsource-polyfill', // IE hot reloading
        'webpack-hot-middleware/client?reload=true',
        appconfig.APP_ENTRY
    ],
    target: 'web',
    output: {
        path: appconfig.BUILD_FOLDER,
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: appconfig.CONTENT_BASE
    },
    plugins: [
    new HtmlWebpackPlugin({
        template: appconfig.INDEX_FILE,
        inject: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {test: /\.js$/, include: appconfig.CONTENT_BASE, loaders: ['babel']},
            {test: /(\.css)$/, loaders: ['style', 'css']},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
            {test: /\.(woff|woff2)$/, loader: 'url?prefix=font/&limit=5000'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
        ]
    }
};
