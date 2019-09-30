//webpack.config.js

module.exports = {
    entry: [ './app/main.js' ],
    output: {
        filename: './../bundle.js'
    },
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        port: 3000
    },
    mode: 'development'
};