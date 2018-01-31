# Readme 

This is an example of various `cloudfront-express` "middleware" functions. You can read more about how these works in this post; but if you want to inject them into your development Webpack config, add the lines: 

	devServer: {
		setup: function(app){
			app.use(serverlessRedirect.pathPattern(), serverlessRedirect.middleware);
			app.use(serverlessDynamicCss.pathPattern(), serverlessDynamicCss.middleware);
		}
	}

That causes the WebPack dev server to use this middleware.