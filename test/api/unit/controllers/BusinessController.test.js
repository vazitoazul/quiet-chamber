var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');

describe('BusinessController',function(){
  var businessId;
  describe('Managing a business ',function(){
    before(function(done) {
       user
         .post('/auth/local')
         .send({identifier : 'test@dinabun.com',password : 'testtest'})
         .end(done);
    });
    before(function(done){
        user
          .post('/updateintlcredential')
          .send({newCredential:'ec0401234987'})
          .end(done)
    });

    it('should create a business',function(done){
        user
          .post('/createBusiness')
          .send({ business :
                    { labels: [ 'automovile', 'propaganda', 'plumber' ],
                    telephones: ['12341234','123423'],
                    name: 'negocio',
                    description: 'asdfsdf',
                    cityLabel: 'Quito, Ecuador',
                    placesIds:
                     [ 'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
                       'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
                       'ChIJ1UuaqN2HI5ARAjecEQSvdp0',
                       'ChIJn3xCAkCa1ZERclXvWOGRuUQ' ],
                    email: 'asdf@asdf.com' }
                })
          .expect(function(res,err){
            businessId = res.body.id;
            res.body.should.have.deep.property('name','negocio');
          })
          .end(done)
    });

    it('it should return the user business',function(done){
        user
          .get('/getBusiness')
          .expect(function(res,err){
            res.body.should.have.property('length',1);
            businessId = res.body[0].id;
          })
          .end(done)
    });

    it('should return bad request becouse the business is not from current user',function(done){
        user
          .post('/updateBusiness/12341234')
          .send({business : { labels: [ 'accesories', 'propaganda' ],
                telephones: '1234,1234',
                name: 'negocio',
                description: 'asdfsdf',
                cityLabel: 'Quito, Ecuador',
                placesIds:
                 [ 'ChIJN-TvJYNw1ZERnqEqXhutzpQ'],
                email: 'asdf@asdf.com'}
              })
          .expect(400)
          .end(done)
    });

    it('should create a business with two posts',function(done){
        user
          .post('/createBusiness')
          .send({ business : {
                    labels: [ 'art','plumber' ],
                    telephones: '12341234',
                    name: 'deberia postear',
                    description: 'asdfsdf',
                    cityLabel: 'Quito, Ecuador',
                    placesIds:
                     [ 'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
                       'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
                       'chochin',
                       'ChIJn3xCAkCa1ZERclXvWOGRuUQ' ],
                    email: 'asdf@asdf.com' ,
                  },
                  posts : {'0' : { description : 'post 1' , type : 'j' ,name : 'name 12 ', amount : 300} ,
                           '1' :  {description : 'post 2' , type : 'j',name : 'name 32', amount : 400} ,
                           '2' :  {description : 'post 2' , type : 'i',name : 'name 32', amount : 100}
                         }
              })
          .expect(function(res,err){
            res.body.should.property('posts');
          })
          .end(done)
    });

    it('should eddit the last business',function(done){
        user
          .post('/updateBusiness/'+businessId)
          .send({ labels: [ 'automovile', 'plumber' ],
                telephones: ['1234','1234'],
                name: 'negocio',
                description: 'loco loco',
                cityLabel: 'Quito, Ecuador',
                placesIds:
                 ['ChIJN-TvJYNw1ZERnqEqXhutzpQ'],
                email: 'asdf@asdf.com'})
          .expect(function(res,err){
            res.body.should.have.property('description').equal('loco loco');
          })
          .end(done)
    });

    it('should delete the business',function(done){
        user
          .post('/deleteBusiness/'+businessId)
          .expect(function(res,err){
            res.body.should.have.property('id').equal(businessId);
          })
          .end(done)
    });

  });
});
