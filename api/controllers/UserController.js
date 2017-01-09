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
			console.log(updated[0]);
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
	}
}
