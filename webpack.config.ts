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
    publicPath: process.env.NODE_ENV === 'production' ? '/marcos.dev/' : '/',
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false,
      "crypto": false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                moduleResolution: "node"
              }
            }
          }
        ]
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(png|jpe?g|glb|gltf|wasm)$/,
        type: "asset/resource",
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PUBLIC_URL': JSON.stringify('/marcos.dev')
    }),
    new HtmlWebpackPlugin({
      template: "public/index.html",
      publicPath: process.env.NODE_ENV === 'production' ? '/marcos.dev/' : '/'
    }),
    new ForkTsCheckerWebpackPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    hot: true
  }
};

export default config;