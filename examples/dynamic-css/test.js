var expect = require('chai').expect;
var dynamicCss = require('./index.js');

var testRequest = {
	Records: [
		{
			cf: {
				request: {
					headers: {
						host: [
							{
								value: 'd123.cf.net',
								key: 'Host'
							}
						]
					},
					clientIp: '2001:cdba::3257:9652',
					uri: '/experiment-pixel.jpg',
					method: 'GET'
				},
				config: {
					distributionId: 'EXAMPLE'
				}
			}
		}
	]
};

describe('handler', function(){
	it("produces a valid CloudFront object", function(done){
		dynamicCss.handler(testRequest, null, function(err, response){
            expect(err).to.be.null;
            expect(response.status).to.equal('200');
            expect(response.statusDescription).to.equal('OK');
            expect(response.body).to.be.a('string');
            expect(response.headers).to.be.a('object');
            done();
		});
	});
});
