var path = require('path');
var webpack = require('webpack');
var glob = require('glob');
var Ex = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
/*
=============
1.“__dirname”：
    是nodejs中的一个全局变量，它指向当前执行脚本所在的目录。
2."path":
    nodejs的模块，join是拼接路径
2.运行方式：
    npm run {script name}如：npm run build；具体的命令配置见package.json文件中的scripts
============
*/
function getEntried(o){
    var files = glob.sync(o.src);
    var arr = [];
    var copeWebpack = [];
    var newEntries = files.reduce(function(memo, file) {
        var name = o.reg(file);
        if(name && o.modules){
            var key = './modules/' + name + '/' + name;
            webpack_config.entry[key] = path.join(__dirname + '/src/modules/'+name+'/','index');

            var pattern = './src/modules/' + name + '/static/*';
            glob(pattern, {nodir: true}, function (err, files) {
                if(files.length){
                    copeWebpack.push({ from: './src/modules/'+name+'/static', to: './modules/' + name + '/static'});
                }
            });
        }else{
            if(name != 'me'){
                webpack_config.entry.me.push(path.join(__dirname + '/src/me/'+name));
            }
        }
    }, {});
    webpack_config.plugins.push(new CopyWebpackPlugin(copeWebpack));
}

var webpack_config = {

    entry: {
        me: [path.join(__dirname + '/src/me/me')] //me声明对象 首先加载
    },
    output: {
        path: path.resolve(__dirname,"dist"),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        },
        {
            test: /\.css$/,
            loader: Ex.extract({ fallback: "style-loader", use: "css-loader"})
        },
        {
            test: /\.less$/,
            loader: Ex.extract({ fallback: "style-loader", use: "css-loader!less-loader"})
        },
        {
            test: /\.(jpg|png)$/,
            loader: "url-loader?limit=8192&name=[name].[ext]&publicPath=./images/&outputPath=./images/"
        },
        {
            test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
            loader: 'file-loader?limit=50000&name=[name].[ext]&publicPath=./fonts/&outputPath=./fonts/'
        }]
    },
    resolve: {
        extensions: ['.js','.css','.less']
    },
    plugins: [
        new Ex('[name].css')
    ]

};

process.noDeprecation = true; //解决“ loaderUtils.parseQuery()” 相关警告问题，不加此句一堆严重警告
if(process.env.NODE_ENV == 'dev'){
    webpack_config.plugins.push(new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'head'
    }));
}

getEntried({
    src: './src/modules/*/index.js',
    reg: function(file){
        return /.*\/(.*?)\/index\.js/.exec(file)[1]
    },
    modules: true
}); //自动配置模块组件文件生成路径方法

getEntried({
    src: './src/me/*.js',
    reg: function(file){
        return /.*\/(.*?)\/*\.js/.exec(file)[1]
    }
}); //自动配置模块组件文件生成路径方法

module.exports = webpack_config;