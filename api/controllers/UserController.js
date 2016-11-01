//User controller

module.exports = {

	getCurrentUser : function(req,res,next){
		User.findOne(req.user.id, function(err, user){
			if(!user){
				return res.badRequest();
			}
			return res.json(user);
		});
	},

	updateIntlCredential : function(req,res,next){
		var newCredential = req.param('newCredential');
		if(!newCredential){
			return res.badRequest();
		}
		User.update({id : req.user.id}, {intlCredential : newCredential}, function(err,updated){
			if(err){
				return res.badRequest();
			}
			return res.ok();
		});
	},

	updateUserInfo : function(req,res,next){

		return res.ok();
	}

}
