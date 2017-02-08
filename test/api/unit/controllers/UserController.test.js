var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');
var secondUser = request.agent('http://localhost:9000');
var user1 = request.agent('http://localhost:9000');
var user2 = request.agent('http://localhost:9000');


describe('UserController',function(){
    var recommender;
    var currentUser;
    var newRecommender;

    describe('update information', function(){
      before(function() {
        user
          .post('/auth/local')
          .send({identifier : 'test@test.com',password : 'testtest'})
          .expect(res => {
            currentUser = res.body.user;
          })
          .end(function(err,next){
          });
      });
      before(function() {
        request(sails.hooks.http.app)
          .post('/auth/local/register')
          .send({email : 'test2@test.com',password : 'testtest', recommender : newRecommender ,confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
          .expect(function(res){
            newRecommender = res.body.user;
          })
          .end((err,ext)=>{
          });
      });

      it('should forbid the action',function(done){
          user
            .post('/updateuserinfo')
            .expect(403)
            .end(done)
      });

      it('should register a second user', function (done) {
        request(sails.hooks.http.app)
          .post('/auth/local/register')
          .send({email : 'test1@test.com',password : 'testtest', confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
          .expect(function(res){
            recommender = res.body.user;
            res.body.should.have.property('user');
          })
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

    describe('get recommender user',function(){


      it('should get a response with user and recommender undefined',function(done){
          request(sails.hooks.http.app)
            .post('/getRecommenderUser')
            .expect((res) => {
              res.body.should.have.property('user').equal('');
              res.body.should.have.property('recommender').equal('');
            })
            .end(done)
      });

      it('should get a response with user and recommender undefined because the id is from the same user',function(done){
          user
            .post('/getRecommenderUser')
            .send({'id' : currentUser})
            .expect((res) => {
              res.body.should.have.property('user').equal('');
              res.body.should.have.property('recommender').equal('');
            })
            .end(done)
      });

      it('should get the user aundefined and a recommender objct',function(done){
          request(sails.hooks.http.app)
            .post('/getRecommenderUser')
            .send({'id' : recommender})
            .expect((res) => {
              res.body.should.have.property('user').equal('');
              res.body.should.have.property('recommender').not.equal('');
            })
            .end(done)
      });


      it('should get the user object and a recommender object',function(done){
          user
            .post('/getRecommenderUser')
            .send({'id' : recommender})
            .expect((res) => {
              res.body.should.have.property('user').not.equal('');
              res.body.should.have.property('recommender').not.equal('');
            })
            .end(done)
      });
    });

    describe('set recommender user',function(){
      before(function() {
        request(sails.hooks.http.app)
          .post('/auth/local/register')
          .send({email : 'test3@test.com',password : 'testtest', recommender : newRecommender ,confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
          .expect(function(res){
          })
          .end((err,ext)=>{
          });
      });
      before(function() {
        secondUser
          .post('/auth/local')
          .send({identifier : 'test1@test.com',password : 'testtest'})
          .expect(res => {
          })
          .end((err,ext)=>{
          });
      });

      it('should return a bad request response becouse no recommender id',function(done){
          user
            .post('/setRecommender')
            .expect(400,done);
      });

      it('should return a bad request response becouse the id is not from a real user',function(done){
          user
            .post('/setRecommender')
            .send({'recommender' : '12341234'})
            .expect(400,done);
      });

      it('should return a bad request response becouse the id is from the same user',function(done){
          user
            .post('/setRecommender')
            .send({'recommender' : currentUser})
            .expect(400,done);
      });

      it('should change the user recommender',function(done){
          user
            .post('/setRecommender')
            .send({'recommender' : recommender})
            .expect(200)
            .end(done);
      });

      it('should return user object with the recommender parameter filled',function(done){
          user
            .post('/getRecommenderUser')
            .send({'id' : recommender})
            .expect((res) => {
              res.body.user.recommender.should.have.property('email');
              res.body.should.have.property('recommender').not.equal('');
            })
            .end(done)
      });

      it('should change the user recommender again and delete from lastone',function(done){
          user
            .post('/setRecommender')
            .send({'recommender' : newRecommender})
            .expect(200)
            .end(done);
      });


      it('should try to register a new user with a false recommender id ',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'userWithFalse@test.com',password : 'testtest', recommender : '12341234' ,confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
            .expect(function(res){
              res.body.should.have.property('user');
            })
            .end(done)
      });

      it('should register a new user with same recomender ',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test4@test.com',password : 'testtest', recommender : newRecommender ,confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
            .expect(function(res){
              res.body.should.have.property('user');
            })
            .end(done)
      });

      it('should register a new user with same recomender and fill it',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test5@test.com',password : 'testtest', recommender : newRecommender ,confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
            .expect(function(res){
              res.body.should.have.property('user');
            })
            .end(done)
      });


      it('should return a badRequest because the recommender is with full recommended',function(done){
        secondUser
          .post('/setRecommender')
          .send({'recommender' : newRecommender})
          .expect((res) => {
            res.should.have.property('status').equal(400);
          })
          .end(done);
      });

      it('should register a new user with no recommender becouse is full ',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'noRecmonder@test.com',password : 'testtest', recommender : newRecommender ,confirmation :'testtest','g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
            .expect(function(res){
              res.body.should.have.property('user');
            })
            .end(done)
      });
    });

});
