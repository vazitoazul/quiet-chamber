// this policy will check if the connected user has already updated it's
// intlCredential attribute for allowing it to continue

module.exports = function(req,res,next){
  if(!req.user){
    return res.badRequest();
  }
  if(!req.user.intlCredential){
    return res.forbidden();
  }
  return next();
};
