import path from 'path';
import webpack from 'webpack';
import { PROD_NODE_ENV } from './src/utils/constant.util';

const config: webpack.Configuration = {
  mode:
    process.env.NODE_ENV === PROD_NODE_ENV
      ? process.env.NODE_ENV
      : 'development',
  entry: {
    home: './src/public/js/home.js',
    card: './src/public/js/card.js'
  },
  output: {
    path: path.resolve(__dirname, './dist/public/js'),
    filename: '[name].js'
  }
};

export default config;
