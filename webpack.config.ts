import { Configuration } from 'webpack';
import webpack from "webpack";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';

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
    publicPath: isProduction ? "/anime-foliage/" : "/",
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
  new HtmlWebpackPlugin({ template: 'public/index.html' }),
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
    "process.env.PUBLIC_URL": JSON.stringify(isProduction ? "/anime-foliage" : "")
  }),
  new webpack.ProvidePlugin({
    process: "process/browser" // 👈 Fix process not defined
  })
],
};

export default config;