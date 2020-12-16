/* used to drive web pack to create the development package */
const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    // This is the only change from the production version
    mode: "development",
    devtool: 'source-map',
    entry: {
        background: path.resolve(__dirname, "background.js"),
        error_popup: path.resolve(__dirname, "error_popup.js"),
        content: path.resolve(__dirname, "content.js"),
        "./modules/input_key": path.resolve(__dirname, "./modules/input_key.js"),
        "./modules/utils": path.resolve(__dirname, "./modules/utils.js")
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|html)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'manifest.json', to: 'manifest.json' },
                { from: 'data.json', to: 'data.json' }

            ],
        })
    ]
};
