var keys={
  facebook:sails.config.passport.facebook.options.clientID,
  google:sails.config.passport.google.options.clientID
};
/**
 * Authentication Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */
var AuthController = {
  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout: function (req, res) {
    req.logout();
    // mark the user as logged out for auth purposes
    req.session.authenticated = false;
    res.redirect('/');
  },

  /**
   * Create a third-party authentication endpoint
   *
   * @param {Object} req
   * @param {Object} res
   */
  provider: function (req, res) {
    passport.endpoint(req, res);
  },

  /**
   * Create a authentication callback endpoint
   *
   * This endpoint handles everything related to creating and verifying Pass-
   * ports and users, both locally and from third-aprty providers.
   *
   * Passport exposes a login() function on req (also aliased as logIn()) that
   * can be used to establish a login session. When the login operation
   * completes, user will be assigned to req.user.
   *
   * For more information on logging in users in Passport.js, check out:
   * http://passportjs.org/guide/login/
   *
   * @param {Object} req
   * @param {Object} res
   */
  callback: function (req, res) {
    function tryAgain (challenges) {

      // If an error was thrown, redirect the user to the
      // login, register or disconnect action initiator view.
      // These views should take care of rendering the error messages.
      var action = req.param('action');

      //set default when nothing comes up
      challenges = challenges || {message:'login_error'};

      switch (action) {
        case 'register':
      // if the request is waiting for a jsno response it gets
      // false for success if not it redirect to root
         if(!req.wantsJSON){
            res.redirect('/');
         }else{
            if(challenges.message){
              res.json({success:false, error: challenges.message});
            }else{
              res.json({success:false, error: challenges});
            }
         }
        break;
        case 'disconnect':
          res.redirect('back');
        break;
        default:
          if(req.wantsJSON){
            res.json({success:false, error: challenges});
          }else{
            res.redirect('/');
          }

      }
    }
    console.log('params',req.allParams());
    passport.callback(req, res, function (err, user, challenges, statuses) {
      if (err || !user) {
        return tryAgain(challenges);
      }

      req.login(user, function (err) {
        if (err) {

          return tryAgain(err);
        }

        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;

        // Upon successful login, return the user id

        if(!req.wantsJSON){
          return res.redirect('/acco');
        }else{
          return res.json({user : user.id,success:true});
        }

      });
    });
  },

  /**
   * Disconnect a passport from a user
   *
   * @param {Object} req
   * @param {Object} res
   */
  disconnect: function (req, res) {
    passport.disconnect(req, res);
  },

  /**
    Handle send to the client the key necesary to initialize any third party provider authenticator
  */
  key:function(req,res){
    res.json({key:keys[req.param('provider')]});
  },
  facebook:function(req,res){

  }
};

module.exports = AuthController;
