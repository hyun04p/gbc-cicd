const path = require('path');
const ShebangPlugin = require('webpack-shebang-plugin');

module.exports = {
  entry: './src/server.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'themenu-cicd.bundle.js',
  },
  plugins: [new ShebangPlugin()],
  mode: 'production',
};
