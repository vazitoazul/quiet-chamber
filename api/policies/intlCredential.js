// this policy will check if the connected user has already updated it's
// intlCredential attribute
module.exports = function(req,res,next){
  console.log(req.user);
  // if (req.user) {
  //   return next();
  // }

  // return res.forbidden('You are not permitted to perform this action.');
  return next();
};
