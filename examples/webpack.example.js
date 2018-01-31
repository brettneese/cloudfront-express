/**
 *
 * An example webpack config for cloudfront-express. The copypasta magic you're looking for is in devServer.setup.
 */

const serverlessRedirect = require('./redirect-to-auth');
const serverlessDynamicCss = require('./dynamic-css');
const webpack = require('webpack');

//merge in all the stuff from the common configuration file and add just what we need for development
module.exports = Merge(CommonConfig, {
	devServer: {
		setup: function(app){
			app.use(serverlessRedirect.pathPattern(), serverlessRedirect.middleware);
			app.use(serverlessDynamicCss.pathPattern(), serverlessDynamicCss.middleware);
		}
	}
});
