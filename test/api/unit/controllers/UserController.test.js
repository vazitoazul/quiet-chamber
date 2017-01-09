var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('UserController',function(){
  describe('update info',function(){
    before(function(done) {
      user
        .post('/auth/local')
        .send({identifier : 'jfrosero@udlanet.ec',password : 'testtest'})
        .end(done);
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

    it('should generate a token for mail verification',function(done){
        user
          .post('/getMailVerification')
          .send()
          .expect((result)=>{
            result.body.should.have.property('success').equal(true);
            result.body.should.have.property('address').equal('jfrosero@udlanet.ec');
          })
          .end(done);
    });
    // it('should not generate a new token and inform about that',function(done){
    //     user
    //       .post('/getMailVerification')
    //       .send()
    //       .expect((result)=>{
    //         result.body.should.have.property('success').equal(false);
    //       })
    //       .end(done);
    // });
    //en esta parte se debe hacer algo para hacer que el usuario aparezca como si hubiese confirmado su correo
    it('should not generate a new token and inform about that',function(done){
        user
          .post('/getMailVerification')
          .send()
          .expect((result)=>{
            result.body.should.have.property('success').equal(false);
          })
          .end(done);
    });


  });
});
