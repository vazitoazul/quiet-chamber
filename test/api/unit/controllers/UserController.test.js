var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var currentUser = request.agent('http://localhost:9000');
var extraUser = request.agent('http://localhost:9000');
var mailNotVerifiedUser = request.agent('http://localhost:9000');
var recaptchaResponse='03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'


describe('UserController',function(){
    var newRecommended,newRecommender,alternateRecommender, extraUserId;
    before(function(done){
      var userModel =sails.models.user;
      //get the id for a created User who is going to be the recommender
      userModel.findOne({email:'newRecommender@dinabun.com'}).populate('passports').exec((err,usera)=>{
        if(err)return done(err);
        newRecommender=usera;
        userModel.findOne({email:'alternateRecommender@dinabun.com'}).populate('passports').exec((err,userb)=>{
          if(err)return done(err);
          alternateRecommender=userb;
          done();
        });
      });
    });

    describe('update information', function(){
      before(function(done) {
        //this user is going to be used all accross this tests
         currentUser
           .post('/auth/local')
           .send({identifier : 'currentUser@dinabun.com',password : 'testtest'})
           .expect(200)
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
        			firstName: 'Federico',
              lastName: 'Contreras',
        			telephones : ['0997226768','040302038'],
        			contactEmail : 'ferediquito@contreras.com',
        			latitude : 0.212532,
        			longitude : -72.1223112,
        			address : 'Cerca de la casa'
        		})
            .expect(200)
            .expect((res)=>{
              var body = res.body;
              body.firstName.should.equal('Federico');
              body.should.have.property('contactInfo');
              body.contactInfo.should.have.property('address');
              body.contactInfo.address.should.equal('Cerca de la casa');
            })
            .end(done);

      });
    });

    describe('geting user recommender tests',function(){

      before((done)=>{
        currentUser
          .get('/getcurrentuser')
          .expect(200)
          .expect(function(res){
            newRecommended=res.body;
          })
          .end(done)

      })

      it('should not be returned because there is not id parameter',function(done){
          request(sails.hooks.http.app)
            .get('/getRecommenderUser')
            .expect(404)
            .end(done);
      });

      it('should return a badRequest because the id is from the same user',function(done){
          currentUser
            .get('/getRecommenderUser/'+newRecommended.id)
            .expect(409)
            .end(done)
      });

      it('should get the recommender in response',function(done){
          currentUser
            .get('/getRecommenderUser/'+newRecommender.id)
            .expect(200)
            .expect((res) => {
              res.body.recommender.should.have.property('id');
              res.body.recommender.id.should.equal(newRecommender.id);
            })
            .end(done)
      });

    });

    describe('creating users with recommenders test',function(){
      before(function(done){
        extraUser
          .post('/auth/local')
          .send({identifier : 'extraUser@dinabun.com',password : 'testtest'})
          .expect((res)=>{
            extraUserId = res.body.user;
          })
          .end(done);
      });

      it('should return an error if an invalid recommender is sent',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'userWithFalse@dinabun.com',password : 'testtest', recommender : '12341234' ,confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(409)
            .end(done)
      });

      it('should register a user with newRecommender as recommender',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test5@dinabun.com',password : 'testtest', recommender : newRecommender.id ,confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(function(res){
              res.body.should.have.property('hasRecommender').equal(true);
              res.body.should.have.property('recommender').equal(newRecommender.id);
            })
            .end(done)
      });

      it('should automatically select alternateRecommender as recommender for newRecommender has already a recommended user',function(done){
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test4@dinabun.com',password : 'testtest',confirmation :'testtest','g-recaptcha-response' : recaptchaResponse})
            .expect(200)
            .expect(function(res){
              res.body.should.have.property('hasRecommender').equal(true);
              res.body.should.have.property('recommender').equal(alternateRecommender.id);
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
          tokensModel.destroy({user:newRecommended.id},(err,deleted)=>{
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
