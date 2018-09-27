var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');


describe('PostController',function(){
  var business;
  var postId;
  before(function(done) {
     user
       .post('/auth/local')
       .send({identifier : 'businessowner@dinabun.com',password : 'testtest'})
       .end(()=>{
         user
           .get('/getBusiness')
           .expect(function(res,err){
             business = res.body[0];
           })
           .end(done)
       });
  });
  describe('Manage posts ',function(){

    it('create a post',function(done){
        user
          .post('/createPost')
          .send({
            business : business.id ,
            type: 'd' ,
            labels : business.labels,
            placesIds: business.placesIds,
            cityLabel:business.cityLabel,
            details:{
              description:'Queremos salvar perritos en quito',
              reason:'El dinero se va a utilizar para recoger los perros',
              minDonation: 100
            },
            name : 'Salva perros en quito'
          })
          .expect(200)
          .expect(function(res,err){
            postId=res.body.id;
            res.body.should.have.property('id');
            res.body.name.should.equal('Salva perros en quito');
          })
          .end(done)
    });

    it('edit post',function(done){
        user
          .post('/updatePost/'+postId)
          .send({
            name: 'Vuelve a salvar perros en quito'
          })
          .expect(200)
          .expect(function(res,err){
            res.body.name.should.equal('Vuelve a salvar perros en quito');
          })
          .end(done)
    });

    it('delete post',function(done){
        user
          .post('/deletePost/'+postId)
          .send()
          .expect(function(res,err){
            res.body.should.have.deep.property('id').equal(postId);
          })
          .end(done)
    });

    it('serach post',function(done){
        user
          .post('/searchPosts')
          .send({
            location : ['ChIJn3xCAkCa1ZERclXvWOGRuUQ'],
            type : 'i'
          })
          .expect(function(res,err){
            res.body[0].should.have.property('name').equal('Invierte en calcentines');
          })
          .end(done)
    });
  });

  describe('upload picture', ()=>{
    it('sign url', (done)=>{
      user
        .get('/signawsurl?file=banana.jpeg&type:jpeg')
        .expect((res,err)=>{
          res.body.should.have.property('url').equal('https://quiet-staging.s3.amazonaws.com/banana.jpeg');
        })
        .end(done)
    });
  });

});
