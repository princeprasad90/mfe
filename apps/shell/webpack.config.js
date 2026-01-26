const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  entry: path.resolve(__dirname, "src", "index.js"),
  output: {
    publicPath: "auto",
    clean: true
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        cbmsApp: "cbmsApp@http://localhost:3001/assets/remoteEntry.js",
        cdtsApp: "cdtsApp@http://localhost:3002/assets/remoteEntry.js"
      },
      shared: {
        react: { singleton: true, requiredVersion: "18.2.0" },
        "react-dom": { singleton: true, requiredVersion: "18.2.0" },
        "@mfe/notification-sdk": { singleton: true }
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html")
    })
  ]
};
