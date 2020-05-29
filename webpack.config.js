const path = require('path');

module.exports = {
	entry: './lib/index.js',
	output: {
		filename: 'background.js',
		path: path.resolve(__dirname),
		libraryTarget: 'umd'
	},
	resolve: {
		extensions: ['*', '.js'],
		modules: ['node_modules', 'lib']
	},
	node: {
		fs: 'empty'
	},
	devtool: 'source-map'
};