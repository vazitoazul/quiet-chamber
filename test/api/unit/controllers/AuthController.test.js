var request = require('supertest');
var chai = require('chai')
  , should = chai.should();

describe('AuthController', function(){
	describe('register',function(){

		   it('should return success equal false because of missing param', function (done) {
		      request(sails.hooks.http.app)
		        .post('/auth/local/register')
		        .send({email : 'test'})
		        .expect(function(res){

	        		res.body.should.have.property('success').equal(false);
	      		})
	        	.end(done)
		   
		    });

		    it('should return success equal false because wrong email validation', function (done) {
		      request(sails.hooks.http.app)
		        .post('/auth/local/register')
		        .send({email : 'test',password : 'test'})
		        .expect(function(res){

		        	res.body.should.have.property('success').equal(false);
	      		})
	        	.end(done)
		   
		    });

	});

});