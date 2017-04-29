var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var currentUser = request.agent('http://localhost:9000');
var extraUser = request.agent('http://localhost:9000');
var mailNotVerifiedUser = request.agent('http://localhost:9000');
var recaptchaResponse='03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'


describe('UserController',function(){
    var currentUserId,newRecommenderId, extraUserId;
    before(function(done){
      var userModel =sails.models.user;
      //get the id for a created User who is going to be the recommender
      userModel.findOne({email:'newRecommender@dinabun.com'}).populate('passports').exec((err,usera)=>{
        if(err)return done(err);
        newRecommenderId=usera.id;
        done();
      });
    });

    describe('update information', function(){
      before(function(done) {
        //this user is going to be used all accross this tests
         currentUser
           .post('/auth/local')
           .send({identifier : 'currentUser@dinabun.com',password : 'testtest'})
           .expect((res)=>{
             currentUserId = res.body.user;
           })
           .end(done);
      });
      it('should forbid the action because no intlCredential has been configured for this user',function(done){
          currentUser
            .post('/updateuserinfo')
            .expect(403)
            .end(done)
      });
      it('should update user intlCredential',function(done){
          currentUser
            .post('/updateintlcredential')
            .send({newCredential:'ec123412341234'})
            .expect(200)
            .end(done)
      });
      it('should update user information',function(done){
          currentUser
            .post('/updateuserinfo')
            .send({	userFirstName: 'Federico',
        			userLastName: 'Contreras BB',
        			contactFirstName : 'Federico',
        			contactLastName : 'Contreras',
        			telephone : ['0997226768','040302038'],
        			contactEmail : 'ferediquito@contreras.com',
        			latitude : '',
        			longitude : '',
        			addressLabel : 'Una descripción de la dirección'
        		})
            .expect(200)
            .expect((res)=>{
              res.body.should.have.deep.property('contactInfo.firstName','Federico');
              res.body.should.have.deep.property('contactInfo.email','ferediquito@contreras.com');
            })
            .end(done);

      });
    });

    describe('geting user recommender tests',function(){

      it('should return a bad request becouse there is not id parameter',function(done){
          request(sails.hooks.http.app)
            .post('/getRecommenderUser')
            .expect(400)
            .end(done);
      });

      it('should return a badRequest because the id is from the same user',function(done){
          currentUser
            .post('/getRecommenderUser')
            .send({'id' : currentUserId})
            .expect(409)
            .end(done)
      });

      it('should get the recommender in response',function(done){
          currentUser
            .post('/getRecommenderUser')
            .send({'id' : newRecommenderId})
            .expect((res) => {
              res.body.recommender.should.have.property('email');
            })
            .end(done)
      });

    });

    describe('setting users recommender test',function(){
      before(function(done){
        extraUser
          .post('/auth/local')
          .send({identifier : 'extraUser@dinabun.com',password : 'testtest'})
          .expect((res)=>{
            extraUserId = res.body.user;
          })
          .end(done);
      });
      it('should return a bad request response because it has no recommender id',function(done){
          currentUser
            .post('/setRecommender')
            .expect(400,done);
      });

      it('should return a bad request response because the id is not from a real user',function(done){
          currentUser
            .post('/setRecommender')
            .send({'recommender' : '12341234'})
            .expect(400,done);
      });

      it('should return conflict request response because the id is from the same user',function(done){
          currentUser
            .post('/setRecommender')
            .send({'recommender' : currentUserId})
            .expect(409,done);
      });

      it('should set the user recommender',function(done){
          currentUser
            .post('/setRecommender')
            .send({'recommender' : newRecommenderId})
            .expect(200)
            .end(done);
      });

      //Now that we have set a recommender we can test getRecommenderUser again to see if its working
      it('should return user object with the recommender parameter filled',function(done){
          currentUser
            .post('/getCurrentUser')
            .expect((res) => {
              res.body.recommender.should.have.property('email');
            })
            .end(done)
      });


      it('should try to register a new user with a false recommender id ',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'userWithFalse@dinabun.com',password : 'testtest', recommender : '12341234' ,confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(function(res){
              res.body.should.have.property('hasRecommender').equal(false);
            })
            .end(done)
      });

      it('should register a second user with newRecommender as recommender',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test4@dinabun.com',password : 'testtest', recommender : newRecommenderId ,confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(function(res){
              res.body.should.have.property('hasRecommender').equal(true);
            })
            .end(done)
      });

      it('should register the third and last user with newRecommender as recommender',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test5@dinabun.com',password : 'testtest', recommender : newRecommenderId ,confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(function(res){
              res.body.should.have.property('hasRecommender').equal(true);
            })
            .end(done)
      });

      it('should return a conflict request because newRecommender can\'t have more recomended users',function(done){
        extraUser
          .post('/setRecommender')
          .send({'recommender' : newRecommenderId})
          .expect(409)
          .end(done);
      });

      it('should register a new user but with a blank recommender since newRecommender can\'t have more recomended users',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'noRecmonder@dinabun.com',password : 'testtest', recommender : newRecommenderId ,confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(function(res){
              res.body.should.have.property('hasRecommender').equal(false);
            })
            .end(done)
      });
    });

    //this is a unified test for getEmailVerification and verifyMail
    describe('email verification',function(){
      var mailNotVerifiedUserId,
          token;
      before(function(done){
        var tokensModel=sails.models.token;
        mailNotVerifiedUser
        .post('/auth/local')
        .send({identifier : 'mailNotVerifiedUser@dinabun.com',password : 'testtest'})
        .expect((res)=>{
          mailNotVerifiedUserId = res.body.user;
        })
        .end((err)=>{
          //delete currentUser auto generated token for testing purposes
          tokensModel.destroy({user:currentUserId},(err,deleted)=>{
            //create a token in the database to be verified later
            tokensModel.createToken({user:mailNotVerifiedUserId,rol:'m',expireAt:(new Date()).add({days:7})},function(err,result){
                token=result;
                done();
            });
          });
        });

      });
      it('should generate a token for mail verification',function(done){
          currentUser
            .post('/getMailVerification')
            .send()
            .expect(200)
            .expect((result)=>{
              result.body.should.have.property('address').equal('currentUser@dinabun.com');
            })
            .end(done);
      });
      it('should not generate a new token and inform about that',function(done){
          currentUser
            .post('/getMailVerification')
            .send()
            .expect(409)
            .end(done);
      });
      it('should not verify an invalid token',function(done){
          request(sails.hooks.http.app)
            .get('/verifyMail/asdfasdfasdfadf')
            .send()
            .expect('location','/mvf/failure')
            .end(done);
      });
      it('should verify the token',function(done){
          request(sails.hooks.http.app)
            .get('/verifyMail/'+token)
            .send()
            .expect('location','/mvf/success')
            .end(done);
      });
      it('should return the user with mailVerified set on true',function(done){
          mailNotVerifiedUser
            .get('/getCurrentUser')
            .send()
            .expect((result)=>{
              result.body.should.have.property('mailVerified').equal(true);
            })
            .end(done);
      });

    });

    describe('getPassRecovery',function(){

      it('should return a badRequest response when an invalid address is sent',function(done){
        request(sails.hooks.http.app)
          .post('/getPassRecovery')
          .send({email:'invalid@dinabun.com'})
          .expect(400)
          .end(done);
      });

      it('should return a 200 response given an valid email',function(done){
        request(sails.hooks.http.app)
          .post('/getPassRecovery')
          .send({email:'currentUser@dinabun.com'})
          .expect(200)
          .end(done);
      });

      it('should return a 409 response when a token has already been created',function(done){
        request(sails.hooks.http.app)
          .post('/getPassRecovery')
          .send({email:'currentUser@dinabun.com'})
          .expect(409)
          .end(done);
      });


    });
    describe('recoverPass',function(){
      var token;
      before(function(done){
        //reset the agent
        extraUser = request.agent('http://localhost:9000');
        var tokensModel=sails.models.token;
        extraUser
        .post('/auth/local')
        .send({identifier : 'extraUser@dinabun.com',password : 'testtest'})
        .expect((res)=>{
          extraUserId = res.body.user;
        })
        .end((err)=>{
          //create a token in the database to be recover the password later
          tokensModel.createToken({user:extraUserId,rol:'p',expireAt:(new Date()).add({days:1})},function(err,result){
              token=result;
              done();
          });
        });
      });
      it('should return a badRequest when any of the parametes is missing',function(done){
        request(sails.hooks.http.app)
          .post('/recoverPass')
          .send({confirm:'nottests'})
          .expect(400)
          .end(done);
      });
      it('should return a 409 response with pass_not_match error when passwords don\'t match',function(done){
        request(sails.hooks.http.app)
          .post('/recoverPass')
          .send({newpass:'testtest',confirm:'nottests',token:'asdasd'})
          .expect(409)
          .expect((res)=>{
            res.body.error.should.equal('pass_not_match');
          })
          .end(done);
      });
      it('should return a badRequest response with token_invalid message when the token is invalid',function(done){
        request(sails.hooks.http.app)
          .post('/recoverPass')
          .send({newpass:'testtest',confirm:'testtest',token:'asdasd'})
          .expect(400)
          .expect((res)=>{
            res.body.error.should.equal('token_invalid');
          })
          .end(done);
      });

      it('should return a 200 response when everything is fine',function(done){
        request(sails.hooks.http.app)
          .post('/recoverPass')
          .send({newpass:'newtesttest',confirm:'newtesttest',token:token})
          .expect(200)
          .end(done);
      });

      it('should login the user with the new password',function(done){
        request(sails.hooks.http.app)
          .post('/auth/local')
          .send({identifier : 'extraUser@dinabun.com',password : 'newtesttest'})
          .expect(200)
          .end(done);
      });
    });


  });
