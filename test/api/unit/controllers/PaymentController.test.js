var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('PaymentController',function(){
  describe('Create a billing ',function(){
    before(function() {
       user
         .post('/auth/local')
         .send({identifier : 'test@test.com',password : 'testtest'})
         .end(function(err,next){
         });
    });

    it('should forbid the action',function(done){
        user
          .post('/updateuserinfo')
          .expect(403)
          .end(done)
    });

    it('should update user intlCredential',function(done){
        user
          .post('/updateintlcredential')
          .send({newCredential:'ec001001001'})
          .expect(200)
          .end(done)
    });

    it('should redirect to paypal approving url',function(done){
        this.timeout(10000);
        user
          .get('/checkoutPayment')
          .expect(function(res,err){
            res.headers.location.should.include('https://www.sandbox.paypal.com/cgi-bin');
          })
          .end(done)
    });
  });
});
