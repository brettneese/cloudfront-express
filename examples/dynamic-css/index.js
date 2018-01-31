'use strict';

const cloudfrontExpress = require('cloudfront-express');
const _each = require('lodash.foreach');
const css = require('node-css');

const API_URL = process.env.API_URL || 'https://api.website.com';

module.exports.pathPattern = () => {
	return '*org.css*';
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

function generateLogoBackgroundImageCss(currentUser){
	if(currentUser && currentUser.skin && currentUser.skin['background-image']){
		return css('.navbar-brand-with-image', {
			'background-image': 'url("' + API_URL + currentUser.skin['background-image'] + '")'
		});
	} else {
		return '';
	}
}

function generateHeaderColorCss(currentUser){
	if(currentUser && currentUser.skin && currentUser.skin['header-color']){
		return css('.page-header-container', {
			'background-color': currentUser.skin['header-color']
		});
	} else {
		return '';
	}
}

function generateCss(req){
	const cookies = parseCookies(req);

	let body = '';

	if(cookies && cookies['X-User']){
		var currentUser = JSON.parse(
			Buffer.from(cookies['X-User'], 'base64').toString('utf-8')
		);

		body += generateHeaderColorCss(currentUser) +
			generateLogoBackgroundImageCss(currentUser);
	}

	return body;
}

function populateResponse(req, cb){
	let response = {};

	response.status = 200;
	response.headers = {
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/css',
		'Content-Encoding': 'UTF-8'
	};
	response.body = generateCss(req);

	return response;
}

// lambda
module.exports.handler = (event, context, callback) => {

	const response = populateResponse(cloudfrontExpress.fromCf(event));
	
	callback(null, cloudfrontExpress.toCf(response));
};

// express
module.exports.middleware = (req, res, next) => {

	const response = populateResponse(req);

	cloudfrontExpress.sendExpressResponse(response, req, res, next);
};
