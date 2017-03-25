var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('PostController',function(){
  var businessId;
  before(function(done) {
     user
       .post('/auth/local')
       .send({identifier : 'test@dinabun.com',password : 'testtest'})
       .end(done);
  });
  before(function(done){
      user
        .get('/getBusiness')
        .expect(function(res,err){
          businessId = res.body[0].id;
        })
        .end(done)
  });

  describe('Manage posts ',function(){
    it('create a post',function(done){
        user
          .post('/createPost')
          .send({description : 'test@dinabun.com' , business : businessId , type: 'donation'})
          .expect(function(res,err){
            console.log(res.body);
            res.body.should.have.deep.property('id');
          })
          .end(done)
    });
  });
});
