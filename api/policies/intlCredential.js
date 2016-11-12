// this policy will check if the connected user has already updated it's
// intlCredential attribute for allowing it to continue

module.exports = function(req,res,next){

  if(req.user){
    if(req.user.intlCredential){
      return next();
    }
  }

  return res.forbidden('You are not permitted to perform this action.');
};
