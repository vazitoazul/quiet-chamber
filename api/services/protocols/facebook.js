var fb = require('fb');
var config= sails.config.passport.facebook.options;
module.exports=function(req,callback){

  fb.api('oauth/access_token', {
      client_id: config.clientID,
      client_secret: config.clientSecret,
      grant_type: 'fb_exchange_token',
      fb_exchange_token : req.body.token
  }, function (res) {
      if(!res || res.error) {
          console.log(!res ? 'facebook auth error occurred' : res.error);
          return callback({message:'Error getting facebook token'});
      }

      fb.setAccessToken(res.access_token);
      fb.options({appSecret:config.clientSecret});
      fb.api(req.body.userID, { fields: config.profileFields }, function (profile) {

        if(!profile || profile.error) {
          console.log(!profile ? 'facebook auth error occurred' : profile.error);
          return callback({message:'Error getting facebook user profile'});
        }
        var query    = {
            identifier : profile.id
          , protocol   : 'facebook'
          , tokens     : { token: res.access_token}
          , provider   : 'facebook'
        };
        var prof = profile.__json ? profile.__json : profile;
        passport.connect(req, query, prof, callback);
      });


  });
}
