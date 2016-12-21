var config = sails.config.passport.google.options;
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2(config.clientID);

module.exports=function(req,callback){

  client.verifyIdToken(req.body.token,config.clientID,function(err, login) {
        var payload = login.getPayload();
        var userid = payload['sub'];
        var profile={
          email:req.body.email,
          name: {
            givenName:req.body.givenName,
            familyName:req.body.familyName
          }
        };
        var query={
              identifier : userid,
              protocol   : 'google',
              provider   : 'google'
            };
        passport.connect(req, query, profile, callback);
  });


};
