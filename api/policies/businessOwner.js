/**
 * businessOwner Policy
 *
 * Policy for check if the bussiness to change is from the current owner
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */

module.exports = function (req, res, next) {
  var businessId = req.body['business'] || req.param('id') ;
  Business.find({ user : req.user.id },function(err,found){
    if(err)return next(err);
    for(var business in found){
      if(found[business].id == businessId){
        return next();
      }
    }
    return res.badRequest('none of your business');
  });
};
