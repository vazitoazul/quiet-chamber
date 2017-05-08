/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  //bills related routes
  'post /requestBill' : 'BillController.createBillForPlanPayments',
  'get /allBills' : 'BillController.getAll',
  'get /billxml/:id' : 'BillController.getXml',
  'get /billpdf/:id' : 'BillController.getPdf',
  //authentication routes
  'get /logout': 'AuthController.logout',
  'get /auth/key/:provider': 'AuthController.key',
  'post /auth/local': 'AuthController.callback',
  'post /auth/local/:action': 'AuthController.callback',

  'get /auth/:provider': 'AuthController.provider',
  'post /auth/:provider/callback': 'AuthController.callback',
  'post /auth/:provider/:action': 'AuthController.callback',

  //Mail verification Routes
  'post /getMailVerification': 'UserController.getMailVerification',
  'get /verifyMail/:token': 'UserController.verifyMail',
  //Password recovery routes
  'post /getPassRecovery': 'UserController.getPassRecovery',
  'post /recoverPass': 'UserController.recoverPass',


  '/:page':'RouterController.redirect',
  '/:page/:action':'RouterController.redirect',
  '/:page/:action/:id':'RouterController.redirect',

  '/getcurrentuser' : 'UserController.getCurrentUser',
  '/updateintlcredential' : 'UserController.updateIntlCredential',
  '/updateuserinfo' : 'UserController.updateUserInfo',
  'post /updatebillinginfo' : 'UserController.updateBillingInfo',
  '/getRecommenderUser' : 'UserController.getRecommenderUser',
  '/setRecommender' : 'UserController.setRecommender',

  //PayPal Payments related routes
  'post /checkoutPayment' : 'PaymentController.setExpressCheckout',
  '/cancelPaypal' : 'PaymentController.cancelPayment',
  '/returnPaypal' : 'PaymentController.returnPayment',
  '/paypalipn' : 'PaymentController.ipnListener',
  '/requestPayout' : 'PaymentController.createPayout',
  '/checkPayout' : 'PaymentController.getPayoutState',
  //General Payments related routes
  'get /allPayments' : 'PaymentController.getAll',

  '/createBusiness' : 'BusinessController.createBusiness',
  '/getBusiness' : 'BusinessController.getBusiness',
  '/updateBusiness/:id' : 'BusinessController.updateBusiness',
  '/deleteBusiness/:id' : 'BusinessController.deleteBusiness',

  '/createPost' : 'PostController.createPost',
  '/updatePost/:id' : 'PostController.updatePost',
  '/deletePost/:id' : 'PostController.deletePost',

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
