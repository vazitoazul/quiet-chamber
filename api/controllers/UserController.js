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
				return next(err);
			}
			return res.ok();
		});
	},

	updateUserInfo : function(req,res,next){
		var contactInfo = {
			firstName : req.param('contactFirstName'),
			lastName : req.param('contactLastName'),
			telephones : req.param('telephone'),
			email : req.param('contactEmail'),
			address : {
				latitude : req.param('latitude'),
				longitude : req.param('longitude'),
				label : req.param('label'),
			}
		}
		console.log(contactInfo);
		User.update({id : req.user.id}, {firstName: req.param('userFirstName'), lastName: req.param('userLastName'),contactInfo : contactInfo}, function(err,updated){
			if(err){
				return next(err);
			}
			console.log(updated[0]);
			return res.ok(updated[0]);
		});
	}
}
