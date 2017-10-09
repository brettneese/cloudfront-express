# cloudfront-express

A simple (~100 LOC) library for Lambda@Edge that allows conversion between CloudFront events and Express req/res objects.

# Why would I want do to this?

Our use case for Lambda@Edge is to make middleware that allows a SPA hosted on S3 to do a couple different things that need to be done server-side (like redirects and some dynamic CSS generation). But that makes it hard to test these functions or to run the SPA locally with these in place. 

With this library, I can write Lambda@Edge functions right into Webpack dev server's middleware. I'll have more examples of doing that soon.

Plus Cloudfront's event objects are unreasonably obtuse and confusing. By flattening them into something Expressy, they become much easier to work with.

# API 

There are two exported functions. They are described in much greater detail in the JSDoc comments, but from a high-level, it's just:

## fromCf(cfEvent)

This accepts a Cloudfront viewer request event and transforms it into an Express-like `req` object. Because Lambda@Edge is so limited, the only properties on the returned Express-like `req` object will be:

- headers
- cookies
- method
- url

That's still more than enough to do what can be done with Lambda@Edge

## toCf(res)

This does this opposite: it accepts an Express `res` object and transforms it into a Cloudfront viewer response object. You can then pass this into your Lambda@Edge callback to return a response! 


# Author 
Brett Neese <brett@neese.rocks>