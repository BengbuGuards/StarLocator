const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'], // 从右向左解析
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
        }),
    ],
    devServer: {
        port: 6974,
    },
};
