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


    it('should return a token for the current payment',function(done){
        user
          .post('/checkoutPayment')
          .expect(200)
          .expect(function(res,err){
            res.body.should.have.property('payToken');
          })
          .end(done)
    });
  });
  describe('Getting payments',function(){
    before(function(done) {
       user
         .post('/auth/local')
         .send({identifier : 'buyer@dinabun.com',password : 'testtest'})
         .end(done);
    });
    it('should get all the payments',function(done){
        user
          .get('/allPayments')
          .expect(200)
          .expect((res)=>{
            res.body.should.have.property('payments');
          })
          .end(done);
    });
  });
});
