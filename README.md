# cloudfront-express

A simple (~100 LOC) library for Lambda@Edge that allows conversion between CloudFront events, Express req, and generic response objects.

It's on npm as ["@hbkapps/cloudfront-express"](https://www.npmjs.com/package/cloudfront-express).

# Why would I want do to this?

Our use case for Lambda@Edge is to make middleware that allows a SPA hosted on S3 to do a couple different things that need to be done server-side (like redirects and some dynamic CSS generation). But that makes it hard to test these functions or to run the SPA locally with these in place. 

With this library, I can write Lambda@Edge functions right into Webpack dev server's middleware. I'll have more examples of doing that soon. 

Plus Cloudfront's event objects are unreasonably obtuse and confusing. By flattening them into something Expressy, they become much easier to work with. On the other side, we can use a common generic response object to send down the appropriate `res`, since Express' `res` object is not a static object. 

For example, in our modules, we have a simple populateResponse() function, and two handlers that simply call that function, one for express and one for Lambda. This allows the greatest possible abstraction and the ability to work in both environments:

```
function populateResponse(req, cb){
	let response = {};

	response.status = 200;

	response.headers = {
		'Cache-Control': 'no-cache',
		'Content-Type': 'text/css',
		'Content-Encoding': 'UTF-8'
	};

	doStuffToGenerateBody(req, function(err, body){
		if(err){
			console.log(err);
		}

		response.body = body;

		cb(response);
	});
}

// lambda
module.exports.handler = (event, context, callback) => {
	var req = cloudfrontExpress.fromCf(event);

	cloudfrontExpress.toCf(populateResponse(req));
};

// express
module.exports.middleware = (req, res, next) => {
	cloudfrontExpress.sendExpressResponse(populateResponse(req), req, res, next);
};

```

Because all the logic happens on a generic response object, it becomes very easy to translate between the two execution environments (Lambda and Express/Webpack).

# What is a generic response object?

A generic response object looks like this. Not terribly complicated. ;-)

```
{
    headers: {
        'Blah': 'blah' //required, or blank
    },
    status: 200, // required
    body: "blah" // optional
}

```

# API 

There are three exported functions. They are described in much greater detail in the JSDoc comments, but from a high-level, it's just:

## fromCf(cfEvent)

This accepts a Cloudfront viewer request event and transforms it into an Express-like `req` object. Because Lambda@Edge is so limited, the only properties on the returned Express-like `req` object will be:

- headers
- cookies
- method
- url

That's still more than enough to do what can be done with Lambda@Edge

## toCf(response)

This does this opposite: it accepts a generic `response` object and transforms it into a Cloudfront viewer response object. You can then pass this into your Lambda@Edge callback to return a response! 

## sendExpressResponse(response, req, res, next)

This sends down an Express response given a generic response object. The headers, body, and status will all be appopriately set based on that properties of that object. 

# Author 
Brett Neese <brett@neese.rocks>