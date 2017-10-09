var http = require("http");
var _forEach = require("lodash.foreach");

/**
 * Flatten headers from an expanded CloudFront headers object into an Express-like simple `headers` object
 * @param {object} cfHeaders - an expanded CloudFront `headers` object
 * @returns {object} headers - an Express-like simple `headers` object
 */

function flattenHeaders(cfHeaders) {
  var headers = {};

  _forEach(cfHeaders, function(value, key) {
    headers[key] = value[0].value;
  });

  return headers;
}

/**
 * Expand a simple Express `headers` object into an expanded CloudFront `headers` object
 * @param {object} headers - an Express/Express-like `headers` object.
 * @returns {object} cfHeaders - an expanded CloudFront headers object
 */

function expandHeaders(headers) {
  let cfHeaders = {};

  _forEach(headers, function(value, key) {
    cfHeaders[key.toLowerCase()] = [
      {
        key: key,
        value: value
      }
    ];
  });

  return cfHeaders;
}

/**
 * Parse a CloudFront viewer request event into an Express-like `request` object.
 * @param {object} cfEvent - a CloudFront viewer request event.
 * @returns {object} req - an Express-like request object
 */

exports.parseCloudfrontEvent = function(cfEvent) {
  const cfRequest = cfEvent.Records[0].cf.request;

  const req = {
    headers: flattenHeaders(cfRequest.headers),
    method: cfRequest.method,
    url: cfRequest.uri
  };

  return req;
};

/**
 * Generate a CloudFront viewer `cfResponse` response object from a generic response object.
 * @param {object} response - a  generic response object.
 * @returns {object} cfRes - a CloudFront viewer response object.
 */

exports.generateCloudfrontResponse = function(response) {
  var cfRes = {
    status: response.status.toString(),
    statusDescription: http.STATUS_CODES[response.status],
    headers: expandHeaders(response.headers),
    body: response.body
  };

  return cfRes;
};

/**
 * Generate an Express response from a generic response object.
 * @param {object} response - a generic response object.
 * @returns {object} cfRes - a CloudFront viewer response object.
 */

exports.sendExpressResponse = function(response, req, res, next) {
  
  if (res === req) {
    return next();
  }
  console.log(response.headers);
  console.log(response.body);

  
  _forEach(response.headers, function(value, key) {
    res.set(key, value);
  });

  res.status(response.status);

  if (response.body) {
    //res.send(body);
  } else {
    res.send(" ");
  }
};

exports.fromCf = exports.parseCloudfrontEvent;
exports.toCf = exports.generateCloudfrontResponse;
