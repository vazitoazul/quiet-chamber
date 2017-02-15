//User controller

module.exports = {

	getCurrentUser : function(req,res,next){
		User.findOne(req.user.id, function(err, user){
			if(!user){
				return res.badRequest();
			}
			User.find({recommender : user.id}, (err,found) => {
				if(err) return res.badRequest();
				user.recommended = found;
				return res.json(user);
			});
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
		var info = {
			firstName:req.param('userFirstName'),
			lastName: req.param('userLastName'),
			contactInfo:{
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
		};
		User.update({id : req.user.id}, info, function(err,updated){
			if(err){
				return next(err);
			}
			return res.ok(updated[0]);
		});
	},
	verifyMail:function(req,res,next){
		var token = req.param('token');
		if(!token){return res.badRequest()}
		Token.consumeToken(token,(err,user)=>{
			if(err){
				if(err.tokenNotFound){
					return res.redirect('/mvf/failure');
				}else{
					return next(err);
				}
			}
			User.update(user.id,{mailVerified:true},(err,updated)=>{
				if(err)return next(err);
				res.redirect('/mvf/success');
			});

		});
	},
	getMailVerification:function(req,res,next){
		User.findOne(req.user.id).populate('tokens',{rol:'m'}).exec((err,user)=>{
			if(err)return next(err);
			if(user.tokens.length>0||user.mailVerified){
				res.ok({success:false});
			}else{
				var expireAt= (new Date()).add({days:7});
				var tok={user:user.id,rol:'m',expireAt:expireAt};
				Token.createToken(tok,(err,token)=>{
					if(err)return next(err);
					var info={
						url:'https://dinabun.com/verifyMail/'+token
					};
					var destination = {
						to:user.email,
						subject:'Confirmación de correo'
					};
					mailgun.send('mailVerification',info,destination,(err,result)=>{
						if(err) return next(err);
						res.ok({success:true,address:user.email});
					});
				});
			}
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
	/**
	*Recives an an id and sets the recomender for the current User.
	*In case the user already has one, it changes it for the new one and delete the last form the lastRecommender list
	*
	*@param {String} recommender - The id of the new recommender for the current user.
	*/
	setRecommender : function(req,res,next){
		var recommender = req.param('recommender');
		var currentUser = req.user;
		if(!req.param('recommender')){
			return res.badRequest();
		}
		User.findOne({id : recommender},(err, newRecommender) => {
			if(err) return next(err);
			if(!newRecommender || Object.keys(newRecommender.recommended).length >= 3){
				return res.badRequest();
			}
			if(newRecommender.id === currentUser.id){
				return res.badRequest();
			}
			User.findOne({id : req.user.recommender },(err,lastRecommender) => {
				if(err)return next(err);
				if(lastRecommender){
					delete lastRecommender.recommended[currentUser.id];
					User.update({id:lastRecommender.id},{recommended:lastRecommender.recommended},(err,saved)=>{
						if(err)return next(err);
						User.update({ id:currentUser.id},{recommender : recommender},(err,updated) => {
							if(err||!updated[0])return res.badRequest();
							newRecommender.recommended[currentUser.id] = true;
							User.update({id:newRecommender.id},{recommended:newRecommender.recommended},(err,saved)=>{
								if(err)return next(err);
								return res.ok();
							});
						});
					});
				}
				else{
					User.update({ id:currentUser.id},{recommender : recommender},(err,updated) => {
						if(err)return next(err);
						if(!updated[0])return res.badRequest();
						newRecommender.recommended[currentUser.id] = true;
						newRecommender.save((err,saved)=>{
							if(err)return next(err);
							return res.ok();
						});
					});
				}
			});
		});
	}
}
