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
		User.findOne({intlCredential : newCredential},function(err,user){
			if(user){
				return next(new Error("Credential in use"));
			}
			User.update({id : req.user.id}, {intlCredential : newCredential}, function(err,updated){
				if(err){
					return next(err);
				}
				return res.ok();
			});
		});
	},

	updateUserInfo : function(req,res,next){
		var contactInfo = {
			firstName : req.param('contactFirstName'),
			lastName : req.param('contactLastName'),
			telephones : req.param('telephone').split(','),
			email : req.param('contactEmail'),
			location : {
				latitude : req.param('latitude'),
				longitude : req.param('longitude'),
			},
			address : req.param('addressLabel')
		}
		User.update({id : req.user.id}, {firstName: req.param('userFirstName'), lastName: req.param('userLastName'),contactInfo : contactInfo}, function(err,updated){
			if(err){
				return next(err);
			}
			return res.ok(updated[0]);
		});
	},

	getRecommenderUser : function(req,res,next){
		var response = { user : '', recommender : ''};
		var recommenderId = req.param('id');

		User.findOne({id : recommenderId},(err,recommender) => {
			if(!recommender||err){
				return res.json(response);
			}
			response.recommender = recommender;
			if(!req.user){
				return res.json(response);
			}
			if(req.user.id == recommenderId){
				response.recommender = '';
				return res.json(response);
			}
			User.findOne({id: req.user.id}, (err,found) => {
				if(err||!found){
					return res.json(response);
				}
				response.user = found;
				if(!found.recommender){
					return res.json(response);
				}else{
					User.findOne({id : found.recommender},(err, lastRecommender) => {
						if(err||!lastRecommender){
							return res.json(response);
						}
						response.user['recommender'] = lastRecommender;
						return res.json(response);
					});
				}
			});
		});
	},

	setRecommender : function(req,res,next){
		var recommender = req.param('recommender');
		var currentUser = req.user;
		if(!req.param('recommender')){
			return res.badRequest();
		}
		User.findOne({id : recommender},(err, newRecommender) => {
			if(!newRecommender || err){
				return res.badRequest();
			}
			if(newRecommender.id === currentUser.id){
				return res.badRequest();
			}

			User.findOne({id : req.user.recommender },(err,lastRecommender) => {
				if(err)return res.badRequest();
				if(lastRecommender){
					delete lastRecommender.recommended[currentUser.id];
					lastRecommender.save((err,saved)=>{
						if(err)return res.badRequest();
						User.update({ id:currentUser.id},{recommender : recommender},(err,updated) => {
							if(err||!updated[0])return res.badRequest();
							newRecommender.recommended[currentUser.id] = true;
							newRecommender.save((err,saved)=>{
								if(err)return res.badRequest();
								return res.ok();
							});
						});
					});
				}
				else{
					User.update({ id:currentUser.id},{recommender : recommender},(err,updated) => {
						if(err||!updated[0])return res.badRequest();
						newRecommender.recommended[currentUser.id] = true;
						newRecommender.save((err,saved)=>{
							if(err)return res.badRequest();
							return res.ok();
						});
					});
				}
			});
		});
	}
}
