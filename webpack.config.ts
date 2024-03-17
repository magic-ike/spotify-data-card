import path from 'path';
import webpack from 'webpack';
import { isProdMode } from './src/utils/env.util';
import { DEV_NODE_ENV, PROD_NODE_ENV } from './src/utils/constant.util';

const config: webpack.Configuration = {
  mode: isProdMode() ? PROD_NODE_ENV : DEV_NODE_ENV,
  entry: {
    home: './src/public/js/main/home.js',
    card: './src/public/js/main/card.js'
  },
  output: {
    path: path.resolve(__dirname, './dist/public/js/main'),
    filename: '[name].js'
  },
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};

export default config;
