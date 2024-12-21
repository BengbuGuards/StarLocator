/* eslint-disable no-undef */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: {
        sitecss: './src/css/site.css',
        main: './src/index.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'auto',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'], // 从右向左解析
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // 指定模板文件的位置
            filename: 'index.html', // 设置生成的HTML文件名
        }),
        new HtmlWebpackPlugin({
            template: './src/help.html', // 指定模板文件的位置
            filename: 'help.html', // 设置生成的HTML文件名
            chunks: ['sitecss'], // 指定需要加载的chunk
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
    optimization: {
        minimizer: [`...`, new CssMinimizerPlugin()],
    },
};
/* eslint-enable no-undef */
