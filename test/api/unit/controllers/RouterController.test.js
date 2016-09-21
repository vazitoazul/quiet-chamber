var request = require('supertest');

describe('RouterController', function() {
  describe('redirect', function() {
    it('should return success', function (done) {
      request(sails.hooks.http.app)
        .get('/')
        .expect(200, done);
    });
  });

})