var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');

describe('AuthController', function(){
	describe('register',function(){

		   it('should return success equal false because of missing param', function (done) {
		      request(sails.hooks.http.app)
		        .post('/auth/local/register')
		        .send({email : 'test'})
		        .expect(function(res){
	        		res.body.should.have.property('success').equal(false);
	      		})
	        	.end(done)
		    });

		    it('should return success equal false for a wrong email validation', function (done) {
		      request(sails.hooks.http.app)
		        .post('/auth/local/register')
		        .send({email : 'test',password : 'test'})
		        .expect(function(res){
		        	res.body.should.have.property('success').equal(false);
	      		})
	        	.end(done);
		    });

        it('should return the user already logged in', function (done) {
          request(sails.hooks.http.app)
            .post('/auth/local/register')
            .send({email : 'test@dinabun.com',password : 'testtest', confirmation :'testtest', 'g-recaptcha-response' : '03AHJ_Vuvwyf4S1GmaZsKFLFHKSh10HCtY3TrsmeCB-46UdGxNQSQyRhujfhpX2hlwVosclb2XB7qGCbGMvqU_7o_6LnXIgBuFUXizYnBrYe9B5oqsh2gxfl_DbEBqPKnjyuRQ-IhTiN9FcpJN-m7Zu46au9-1XJtU5xYUIgUxDuk_jazQ_lKCBlfCS9E5APLPboveCL9fdC8ca9jwvUxady4yVjUqpUTSU5lxFMKDu-_kl9GwxG8J7U4twbukg_hiqvoU2LSVqyWjlJBQ-WAZYJuYRTzbsBlBfr27rvVx1JxOxMCS6Nk-p5pQabr-d9uRDxWusLBWSn27QYhXNtgjH5MxVIFdI4sBfGJpAX7jYyDTabbBWh1TDLWzPAe8Iht03kmvG7k1hBaBngv3El3BGl0Rt-5EIxRh1g5G8C9cMujFbmfF7DIS3s1uCFwULNT_zFZVxw_CYhZCgFGkrIlsPKvCiV_ixSau2XgfqyXP0KUR553GFZLFfDrZ2GaAh280YR9G4SHYbBy0nLe16YNV6n6MlyOXL9Zd1Jo6DN5dp0kFHRRjKMMxPUgHLsR2HdKDkCoGgcyT81ZU'})
            .expect(function(res){
              res.body.should.have.property('user');
            })
            .end(done)
        });


        it('should logout the user', function (done) {
          user
            .get('/logout')
            .expect('location','/',done);
        });

        it('should login the new user',(done)=>{
          user
              .post('/auth/local')
              .send({identifier : 'test@dinabun.com',password : 'testtest'})
              .expect((res)=>{
                res.body.should.have.property('user');
              })
              .end((err,res)=>{
                if(err)return done(err);

                return done();
              });
        });

        it('should return the user logged in', function (done) {
          user
            .get('/getcurrentuser')
            .expect(function(res){
              res.body.should.have.property('email').equal('test@dinabun.com');
            })
            .end(done)
        });

	});

});
