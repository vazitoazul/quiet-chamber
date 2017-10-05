var request = require('supertest');
var chai = require('chai')
  , should = chai.should();

describe('RouterController', function() {
  describe('redirect', function() {
    it('should return success', function (done) {
      request(sails.hooks.http.app)
        .get('/')
        .expect(200, done);
    });

    it('(5 > url lentgh) should render homepage with the not found fragment', function (done) {
	      request(sails.hooks.http.app)
	        .get('/user?id=xxxx')
	        .expect(function(res){
            res.text.should.include('<title>Dinabun</title>')
	        })
	        .end(done)
    });

    it('should return 404 not found status', function (done) {
	      request(sails.hooks.http.app)
	        .get('/nourl')
	        .expect(404,done);
    });
  });
});
