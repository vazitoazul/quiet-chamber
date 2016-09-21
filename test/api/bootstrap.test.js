var Sails = require('sails');

  // Global before hook
  before(function (done) {
    // Lift Sails with test database
    Sails.lift({

    }, function(err) {
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