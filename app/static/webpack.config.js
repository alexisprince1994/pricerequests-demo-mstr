const webpack = require('webpack')
const config = {
  entry: {
    priceRequest: __dirname + '/js/index.jsx',
    viewPriceRequest: __dirname + '/js/viewRequests.jsx'
  },
  output: {
    filename: './[name]-bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [ 'css-loader' ]
      }
    ]

  }
}
module.exports = config
