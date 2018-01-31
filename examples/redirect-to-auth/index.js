'use strict';
var jwtDecode = require('jwt-decode');
var cloudfrontExpress = require('cloudfront-express');

module.exports.pathPattern = () => {
	return '/*';
};

function parseCookies(request){
	var list = {},
		rc = request.headers.cookie;

	rc &&
		rc.split(';').forEach(function(cookie){
			var parts = cookie.split('=');

			list[parts.shift().trim()] = decodeURI(parts.join('='));
		});

	return list;
}

function tokenIsValid(currentUser){
	if(currentUser && currentUser.token){
		return (
			jwtDecode(currentUser.token).exp >
			Math.round(new Date().getTime() / 1000, 0)
		);
	}

	return false;
}

function getCurrentUser(req){
	const cookies = parseCookies(req);
	if(cookies && cookies['X-User']){
		var currentUser = JSON.parse(
			Buffer.from(cookies['X-User'], 'base64').toString('utf-8')
		);

		return currentUser;
	}

	return false;
}

function populateResponse(req, cb){
	let authHost = 'auth.website.com';
	let authScheme = 'https://';

	let response = {
		status: 200,
		headers: {}
	};

	let currentUser = getCurrentUser(req);

	if(currentUser && tokenIsValid(currentUser)){

		// just return the request unmodified
		return req;
	}

	response.status = 302; 

	if(req.headers.host.includes('localhost')){
		authHost = process.env.AUTH_HOST || 'localhost:9000';
		authScheme = process.env.AUTH_SCHEME || 'http://';
	} else if(req.headers.host.includes('staging')){
		authHost = 'auth.website.com';		
	} 

	let url = authScheme + authHost + '/?returnUrl=' + encodeURIComponent('http://' + req.headers.host + req.url);
	
	console.log('redirecting to ' + url + '; host is: ' + req.headers.host);
	
	response.headers.Location = url;

	return response;
}

// lambda
module.exports.handler = (event, context, callback) => {
	var req = cloudfrontExpress.fromCf(event);
	var response = cloudfrontExpress.toCf(populateResponse(req));

	callback(null, response);
};

// express
module.exports.middleware = (req, res, next) => {
	cloudfrontExpress.sendExpressResponse(populateResponse(req), req, res, next);
};
