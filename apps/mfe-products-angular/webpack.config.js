const { ModuleFederationPlugin } = require('@angular-devkit/build-angular/node_modules/webpack').container;

module.exports = {
  output: {
    uniqueName: 'productsAngular',
    publicPath: 'auto',
    scriptType: 'module'
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'productsAngular',
      filename: 'assets/remoteEntry.js',
      exposes: {
        './bootstrap': './src/bootstrap.ts'
      }
    })
  ]
};
