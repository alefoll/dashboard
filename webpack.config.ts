import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { Configuration as WebpackConfiguration, DefinePlugin } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

interface Configuration extends WebpackConfiguration {
    devServer?: WebpackDevServerConfiguration;
}

export default function(): Configuration {
    return {
        entry: "./src/index.tsx",
        module: {
            rules: [
                {
                    test    : /\.tsx?$/,
                    use     : "ts-loader",
                    exclude : /node_modules/
                }, {
                    test    : /\.html$/,
                    type    : "asset/resource",
                    generator : {
                        filename: "[name][ext]",
                    }
                }, {
                    test    : /\.(svg|woff2)$/,
                    type    : "asset/resource",
                    generator : {
                        filename: "assets/[name][ext]",
                    }
                }, {
                    test    : /favicon\.png$/,
                    type    : "asset/resource",
                    generator : {
                        filename: "[name][ext]",
                    }
                }, {
                    test    : /\.css$/,
                    use: [MiniCssExtractPlugin.loader, "css-loader"]
                }
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
            plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
            fallback: {
                buffer: require.resolve("buffer"),
                crypto: require.resolve("crypto-browserify"),
                stream: require.resolve("stream-browserify"),
            }
        },
        output: {
            filename : "main.js",
            path     : path.resolve(__dirname, "dist")
        },
        plugins: [
            // @ts-expect-error
            new MiniCssExtractPlugin(),
            new DefinePlugin({
                APP_VERSION: JSON.stringify(require("./package.json").version),
            }),
        ],
        devServer: {
            static: {
                directory: path.resolve(__dirname, "dist"),
            },
            compress     : false,
            host         : "0.0.0.0",
            port         : 8000,
            allowedHosts : "all",
        }
    }
};
