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


    it('should redirect to paypal approving url',function(done){
        user
          .get('/checkoutPayment')
          .expect(function(res,err){
            res.headers.location.should.include('https://www.sandbox.paypal.com/cgi-bin');
          })
          .end(done)
    });
  });
});
