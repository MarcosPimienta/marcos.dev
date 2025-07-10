import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { Configuration as WebpackConfig } from "webpack";
import { Configuration as DevServerConfig } from "webpack-dev-server";

interface Configuration extends WebpackConfig {
  devServer?: DevServerConfig;
}

const config: Configuration = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    clean: true,
    publicPath: process.env.NODE_ENV === 'production' ? '/anime-foliage/' : '/',
  },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: "ts-loader", options: { transpileOnly: true } },
          { loader: "babel-loader", options: {
              presets: [
                ["@babel/preset-env",{ modules: false }],
                ["@babel/preset-react",{ runtime: "automatic" }],
                "@babel/preset-typescript"
              ],
              plugins: [["babel-plugin-reactylon"]]
            }
          }
        ]
      },
      { test: /\.css$/, use: ["style-loader","css-loader"] },
      { test: /\.(png|jpe?g|glb|gltf|wasm)$/, type: "asset/resource" }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser"  // ← polyfill `process`
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
    new ForkTsCheckerWebpackPlugin()
  ],
};

export default config;