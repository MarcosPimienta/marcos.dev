import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import webpack from "webpack";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const isProduction = process.env.NODE_ENV === "production";

const config: Configuration = {
  entry: './src/index.tsx',
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    // ✅ Fix: Correctly set publicPath for GitHub Pages
    publicPath: process.env.PUBLIC_URL,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          },
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", {
                  "modules": false
                }],
                ["@babel/preset-react", {
                  runtime: "automatic"
                }],
                "@babel/preset-typescript"
              ],
              plugins: [
                ["babel-plugin-reactylon"]
              ]
            }
          },
        ],
        exclude: '/node_modules/',
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|glb|gltf|wasm)$/i, // ✅ Add glb/gltf/wasm
        type: 'asset/resource'
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      // this string will be visible inside index.html as htmlWebpackPlugin.options.baseHref
      baseHref: isProduction ? '/anime-foliage/' : '/'
    }),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env.PUBLIC_URL": JSON.stringify(isProduction ? "/anime-foliage" : "/")
    }),
    new webpack.ProvidePlugin({
      process: "process/browser" // 👈 Fix process not defined
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"), // ✅ Serve public folder during dev
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
    hot: true
  }
};

export default config;