var validator = require('validator');
var crypto    = require('crypto');
var recaptcha = require("recaptcha_v2");
var keys = sails.config.recaptcha;
var captcha = new recaptcha({secret:keys.private_key});
/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.register = function (req, res, next) {
  var email    = req.param('email')
    , password = req.param('password')
    , confirmation = req.param('confirmation');;

    
  if (!email) {
    res.body = { error : 'Error.Passport.Email.Missing'};
    return next(new Error('No email was entered.'));
  }
  if (!password) {
    res.body = { error : 'Error.Passport.Password.Missing'};
    return next(new Error('No password was entered.'));
  }
  if (password!==confirmation){
    res.body = { error : 'Error.Passport.Password.DoesntMatch'};
    return next(new Error('No password was entered.'));
  }

  //set recaptcha response to captcha library
  captcha.response = req.body['g-recaptcha-response'];
  //using recatpcha verify package for cheking the recaptcha incomming response
  captcha.verify(function(err,done){
        //Error will finish proccess if exists
        if(err) {
            console.log(`not verified`);
            res.body = { error : 'Error.Recaptcha.verify'};    
            return next(err);
        } 
        if(done) {
           // recaptcha verified
           User.create({
              email    : email
            }, function (err, user) {
              if (err) {
                if (err.code === 'E_VALIDATION') {
                  if (err.invalidAttributes.email) {
                    res.body = { error : 'Error.Passport.Email.Exists'};
                  } else {
                    res.body = { error : 'Error.Passport.User.Exists'};
                  }
                }
                return next(err);
              }

              // Generating accessToken for API authentication
              var token = crypto.randomBytes(48).toString('base64');

              Passport.create({
                protocol    : 'local'
              , password    : password
              , user        : user.id
              , accessToken : token
              }, function (err, passport) {
                if (err) {
                  if (err.code === 'E_VALIDATION') {
                    res.body = { error : 'Error.Passport.Password.Invalid'};
                  }

                  return user.destroy(function (destroyErr) {
                    next(destroyErr || err);
                  });
                }

                next(null, user);
              });
            });
        }      
    });



    



};

/**
 * Assign local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doens't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.connect = function (req, res, next) {
  var user     = req.user
    , password = req.param('password');

  Passport.findOne({
    protocol : 'local'
  , user     : user.id
  }, function (err, passport) {
    if (err) {
      return next(err);
    }

    if (!passport) {
      Passport.create({
        protocol : 'local'
      , password : password
      , user     : user.id
      }, function (err, passport) {
        next(err, user);
      });
    }
    else {
      next(null, user);
    }
  });
};

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function (req, identifier, password, next) {
  var isEmail = validator.isEmail(identifier)
    , query   = {};

  query.email = identifier;
  
  
  User.findOne(query, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false);
    }
    
    Passport.findOne({
      protocol : 'local'
    , user     : user.id
    }, function (err, passport) {
      if (passport) {
        passport.validatePassword(password, function (err, res) {
          console.log(err);
          if (err) {
            return next(err);
          }

          if (!res) {
            console.log('mal pass');
            return next(null, false);
          } else {
            return next(null, user);
          }
        });
      }
      else {
        return next(null, false);
      }
    });
  });
};