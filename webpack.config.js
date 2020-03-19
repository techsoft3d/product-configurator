var path = require("path");

module.exports = {
	entry: "./src/js/app.js",
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "bundle.js",
		publicPath: "./build/"
	},
	mode: "development", 
	module: {
		rules: [
			{
			  test: /\.js/,
			  use: [
				  {"loader" : "babel-loader"},
			  ]
			},
			{
			  test: /\.css$/,
			  use: ["style-loader", "css-loader"],
			}, 			
			{
			  test: /\.tsx?$/,
				use: [{"loader": "ts-loader"}],
				exclude: /node_modules/
			},
			{
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
		],
  },
  devServer: {
    port: 8080
  }
};