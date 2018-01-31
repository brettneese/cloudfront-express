var redirectToAuth = require('./index.js');
var assert = require('assert');
var jwt = require('jsonwebtoken');

const SECONDS_PER_DAY = 24 * 60 * 60;

var cfEvent = {
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
						],
						'user-agent': [
							{
								value: 'test-agent',
								key: 'User-Agent'
							}
						]
					},
					clientIp: '2001:cdba::3257:9652',
					uri: '/',
					method: 'GET'
				},
				config: {
					distributionId: 'EXAMPLE'
				}
			}
		}
	]
};

describe('handler()', function(){
	it('without a token cookie, it should send a valid redirect object', function(next){
		redirectToAuth.handler(cfEvent, null, function(err, callback){
			
			console.log(callback);
			next();
		});
	});

	it('with a token cookie, it should send a valid redirect object', function(next){

		var token = jwt.sign(
			{
				sub: '000000000000000000000002',
				context: {
					id: '000000000000000000000002',
					username: 'machineadmin',
					firstName: 'Machine',
					lastName: 'Admin',
					email: 'machineadmin@hbkengineering.com',
					createdAt: Math.round(new Date().getTime() / 1000, 0),
					updatedAt: Math.round(new Date().getTime() / 1000, 0)
				}
			},
			process.env.HASH_SECRET ||
				'RANDOMTEXTRANDOMTEXTRANDOMTEXTRANDOMTEXTRANDOMTEXTRANDOMTEXTRAND',
			{
				algorithm: 'HS256',
				expiresIn: SECONDS_PER_DAY,
				issuer: 'hbkengineering.com',
				audience: 'hbkengineering.com'
			}
		);
		
		var currentUser = {
			token: token
		};

		var currentUserEnc = new Buffer(JSON.stringify(currentUser)).toString('base64');

		cfEvent.Records[0].cf.request.headers['cookie'] = [ 
			{ key: 'Cookie', value: 'X-HBK-User=' + currentUserEnc } 
		]; 		

		redirectToAuth.handler(cfEvent, null, function(err, callback){

			console.log(callback)
			next();
		});
	});

});
