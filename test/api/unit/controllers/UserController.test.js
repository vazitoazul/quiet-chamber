var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('UserController',function(){
  describe('update info',function(){
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
          .send({newCredential:'ec123412341234'})
          .expect(200)
          .end(done)
    });

  });
});
