var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('PaymentController',function(){
  describe('Create a billing ',function(){
    before(function(done) {
       user
         .post('/auth/local')
         .send({identifier : 'buyer@dinabun.com',password : 'testtest'})
         .end(done);
    });

  });
  describe('Getting payments',function(){
    before(function(done) {
       user
         .post('/auth/local')
         .send({identifier : 'buyer@dinabun.com',password : 'testtest'})
         .end(done);
    });

  });
});
