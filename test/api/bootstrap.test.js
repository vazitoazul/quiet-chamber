var Sails = require('sails');
var path= require('path');
var rc = require('rc');

  // Global before hook
  before(function (done) {
    process.chdir(path.resolve(__dirname,'../../'));
    this.timeout(145000);
    // Lift Sails with test database
    var settings = rc('sails');
    //load fixtures and set up that hook
    settings.hooks.fixtures = require('sails-hook-fixtures');
    settings.fixtures=require('./fixtures.js');
    Sails.lift(settings, function(err) {
      if (err)
        return done(err);

      // Anything else you need to set up
      // ...

      //missing load fixtures

      done();
    });
  });

  // Global after hook
  after(function (done) {
    console.log(); // Skip a line before displaying Sails lowering logs
    Sails.lower(done);
  });
