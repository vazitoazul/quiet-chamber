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
      // false fro success if not it redirect to root
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
          res.json({success:false, error: challenges});
      }
    }

    passport.callback(req, res, function (err, user, challenges, statuses) {
      if (err || !user) {
        console.log('aqui es');
        return tryAgain(challenges);
      }

      req.login(user, function (err) {
        if (err) {

          return tryAgain(err);
        }

        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true;

        // Upon successful login, return the user id
        if(req.param('provider')){
          res.redirect('/acco');
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
  }
};

module.exports = AuthController;
