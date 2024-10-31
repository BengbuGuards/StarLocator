const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/interface/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // 指定模板文件的位置
      filename: 'index.html', // 设置生成的HTML文件名
      inject: 'head', // 将脚本注入到body标签内
      minify: {
        removeAttributeQuotes: true, // 去除属性引号
        collapseWhitespace: true // 压缩空格
      },
      hash: true, // 在文件名中加入hash
    })
  ],
};