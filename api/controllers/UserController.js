//User controller
var crypto    = require('crypto');
module.exports = {

	/**
    *return current logged user.
    *
    *@param {object} req.user - current logged user
    */
	getCurrentUser : function(req,res,next){
		User.findOne(req.user.id).populate('payments').populate('payouts').exec( function(err, user){
			if(err) return next(err);
			if(!user){
				return res.badRequest();
			}
			user.isSubscribed=user.isSubscribed();
			user.totalBalance=user.balance.reduce((a, b) => a + b,0);
      user.payoutRequested=false;
      user.payouts.forEach((pay)=>{
        if(!pay.payed){
          user.payoutRequested=true;
        }
      });
			User.find({recommender : user.id}, (err,found) => {
				if(err) return res.badRequest();
				user.recommended = found;
				if(!user.recommender) return  res.json(user);
				User.findOne({id : user.recommender}, (err,recommender) => {
					if(err) return res.badRequest();
					user.recommender = {
            firstName:recommender.firstName,
            lastName:recommender.lastName,
            email:recommender.email
          };
          console.log(user);
					return res.json(user);
				});
			});
		});

	},
	/**
    *update the user intlCredential parameter.
    *
    *@param {string} newCredential - User's new intlCredential
    */
	updateIntlCredential : function(req,res,next){
		var newCredential = req.param('newCredential');
		if(!newCredential){
			return res.badRequest({error : 'no_credential'});
		}
		User.findOne({intlCredential : newCredential},function(err,user){
			if(err) return next(err);
			if(user){
				return res.json(409,{error : 'credential_in_use'});
			}
			User.update({id : req.user.id}, {intlCredential : newCredential}, function(err,updated){
				if(err){
					return next(err);
				}
				return res.ok({intlCredential : updated[0].intlCredential});
			});
		});
	},
	/**
    *update the user information parameter.
    *
    *@param {string} firstName
    *@param {string} lastName
    *@param {array} telephones
    *@param {string} email
    *@param {object} location - latitude and longitude
    *@param {object} contactInfo
    */
	updateUserInfo : function(req,res,next){
		var info = {
			firstName:req.param('firstName'),
			lastName: req.param('lastName'),
			contactInfo:{
				telephones : req.param('telephone'),
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
	/**
	*Recives a token and looks for it on the database in order to confirm user email
	*
	*@param {string} token - The token that the user recives on the sent email
	*
	*/
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
	/**
	*Gives the authenticated user a new token for mail verification.
	*If there is already a token issued for that user, it returns a success:false response
	*Otherwise sends an email with the token and returns a success:true with the email address to which the email was sent
	*/
	getMailVerification:function(req,res,next){
		User.findOne(req.user.id).populate('tokens',{rol:'m'}).exec((err,user)=>{
			if(err)return next(err);
			if(user.tokens.length>0||user.mailVerified){
				res.json(409,{error:'user_cant_request_mail_verification'});
			}else{
				var expireAt= (new Date()).add({days:7});
				var tok={user:user.id,rol:'m',expireAt:expireAt};
				Token.createToken(tok,(err,token)=>{
					if(err)return next(err);
					var info={
						url:'https://www.dinabun.com/verifyMail/'+token
					};
					var destination = {
						to:user.email,
						subject:'Confirmación de correo'
					};
					mailgun.send('mailVerification',info,destination,(err,result)=>{
						if(err) return next(err);
						res.ok({address:user.email});
					});
				});
			}
		});
	},
	/**
	*returns an object with a status [no logged, logged] and the current logged user with the user tried to set as recommender.
	*In case recommender or current user don't exist it returns a bad reqeuest
	*
	*@param {string} recommenderId
	*/
	getRecommenderUser : function(req,res,next){
		var response = {};
		var recommenderId = req.param('id');

		User.findOne({id : recommenderId},(err,recommender) => {
			if(err) return next(err);
			if(!recommender){
				return res.badRequest({error:'user_does_not_exists'});
			}
			var canRecomend = recommender.canRecomend();
			response['recommender'] = {
				id:recommender.id,
				firstName:recommender.firstName,
				lastName:recommender.lastName,
				canRecomend:canRecomend
			};
			if(!req.user){
				return res.json(200,response);
			}
			if(req.user.id == recommenderId){
				return res.json(409,{error:'same_user'});
			}
			return res.json(200,response);
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
    //can't continue without a recommender id
		if(!req.param('recommender'))return res.badRequest();
    //find recommender
		User.findOne({id : recommender},(err, newRecommender) => {
			if(err) return next(err);
      //if there is nobody with that id
			if(!newRecommender)return res.badRequest({error : 'user_does_not_exists'});
      //if the recommender can't recommend anymore
			if(!newRecommender.canRecomend())return res.json(409,{error : 'user_can_not_recommend'});
      //if they are the same person
			if(newRecommender.id === currentUser.id)return res.json(409,{error : 'same_user'});
      //find the last recommender
			User.findOne({id : req.user.recommender },(err,lastRecommender) => {
				if(err) return next(err);
        //if there is someone delete the relationship between them and replace it with the new recommender
				if(lastRecommender){
					if(lastRecommender.id == newRecommender.id)return res.ok();
					delete lastRecommender.recommended[currentUser.id];
					User.update({id:lastRecommender.id},{recommended:lastRecommender.recommended},(err,saved)=>{
						if(err)return next(err);
						User.update({ id:currentUser.id},{recommender : recommender},(err,updated) => {
							if(err||!updated[0])return res.badRequest();
							newRecommender.recommended[currentUser.id] = true;
							User.update({id:newRecommender.id},{recommended:newRecommender.recommended},(err,saved)=>{
								if(err)return next(err);
                var info={
      						recommender:newRecommender,
                  recommended:req.user
      					};
      					var destination = {
      						to:newRecommender.email,
      						subject:'Tienes un nuevo recomendado - Dinabun'
      					};
      					mailgun.send('recoadded',info,destination,(err,result)=>{
      						if(err) return next(err);
      						return res.ok();
      					});
							});
						});
					});
				}
        //if not, just create a new relationship
				else{
					User.update({ id:currentUser.id},{recommender : recommender},(err,updated) => {
						if(err)return next(err);
						if(!updated[0])return res.badRequest();
						newRecommender.recommended[currentUser.id] = true;
						newRecommender.save((err,saved)=>{
							if(err)return next(err);
              var info={
                recommender:newRecommender,
                recommended:req.user
              };
              var destination = {
                to:newRecommender.email,
                subject:'Tienes un nuevo recomendado - Dinabun'
              };
              mailgun.send('recoadded',info,destination,(err,result)=>{
                if(err) return next(err);
                return res.ok();
              });
						});
					});
				}
			});
		});
	},
	/**
	*
	*Gets an email address and looks it up on the database, if exixts issue a token and send an email with it
	*
	*@param {string} email - The email address that is going to be used
	*/
	getPassRecovery:function(req,res,next){
		var email = req.body.email;
		User.findOne({email:email}).populate('tokens',{rol:'p'}).exec((err,user)=>{
			if(err) return next(err);
			if(!user)return res.badRequest({error:'user_does_not_exists'});
			if(user.tokens.length>0){
				return res.json(409,{error:'token_already_issued'});
			}
			var token={
				user:user.id,
				expireAt:(new Date()).add({days:1}),
				rol:'p'
			};
			Token.createToken(token,(err,token)=>{
				if(err) return next(err);
				var info={
					url:'https://www.dinabun.com/rcp/'+token
				};
				var destination={
					to:user.email,
					subject:'Recuperación de contraseña - Dinabun'
				};
				mailgun.send('passwordReset',info,destination,(err,body)=>{
					if(err){
						Token.destroy({user:user.id,rol:'p'},(delErr,deleted)=>{
							return next(err||delErr);
						});
					}
					res.ok();
				});
			});
		});
	},
	/**
	*
	*Recives a recover password token, password and passwordConfirmation to change a user's password
	*If the user does not have a local passport create one (this is the case when a third-party login method was used)
	*
	*@param {string} token - The token to bee looked up
	*@param {string} newpass - The new password
	*@param {string} confirm - Password confirmation
	*
	*/
	recoverPass:function(req,res,next){
		var body=req.body;
		if(!body.token||!body.newpass||!body.confirm){
			return res.badRequest({error:'missing_parameters'});
		}
		if(body.newpass!==body.confirm){
			return res.json(409,{error:'pass_not_match'});
		}
		Token.consumeToken(body.token,(err,owner)=>{

			if(err){
				//if no token was found send appropiate message
				if(err.tokenNotFound){
					return res.badRequest({error:'token_invalid'});
				}else{
					return next({error:'token_invalid'});
				}
			}
			Passport.findOne({user:owner.id,protocol:'local'},(err,found)=>{
				if(err) return next(err);
				//check if the user already has a local passport
				if(!found){
					//if he does not, create one with the new password
					var token = crypto.randomBytes(48).toString('base64');
					var newPassport={
						protocol    : 'local',
						password    : body.newpass,
						user        : owner.id,
						accessToken : token
					};
					Passport.create(newPassport,(err,passport)=>{
						if(err) return next(err);
						return res.ok();
					});
				}else{
					//Otherwise just update his password
					Passport.update(found.id,{password:body.newpass},(err,updated)=>{
						if(err) return next(err);
						return res.ok();
					});
				}
			});
		});
	},
  /**
  *
  *Updates a user to activate or deactivate automatic subscription
  *
  */
	activateAutoSub: function(req,res,next){
		User.update(req.user.id,{autoSub:req.body.autoSub},(err,updated)=>{
      if(err)return next(err);
      res.json({autoSub:updated[0].autoSub});
    });
	}
}
