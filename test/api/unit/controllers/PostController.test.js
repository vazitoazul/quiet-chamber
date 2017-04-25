var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('PostController',function(){
  var businessId;
  var postId;
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
            postId = res.body.id;
            res.body.should.have.deep.property('id');
          })
          .end(done)
    });

    it('edit post',function(done){
        user
          .post('/updatePost/'+postId)
          .send({description : 'fuking fuck eddited' , type: 'i' , business : businessId})
          .expect(function(res,err){
            res.body.should.have.deep.property('description').equal('fuking fuck eddited');
          })
          .end(done)
    });

    it('delete post',function(done){
        user
          .post('/deletePost/'+postId)
          .send({description : 'fuking fuck eddited' , type: 'i', business : businessId})
          .expect(function(res,err){
            res.body.should.have.deep.property('id').equal(postId);
          })
          .end(done)
    });
  });

});