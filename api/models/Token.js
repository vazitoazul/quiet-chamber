var bcrypt = require('bcrypt')  ,
		shortid    = require('shortid');
require('date-utils');
/**
 * Hash a token .
 *
 * @param {Object}   token
 * @param {Function} next
 */
function hashToken (token, next) {
    bcrypt.hash(token.token, 10, function (err, hash) {
      token.token = hash;
      next(err, token);
    });
}

module.exports={
	schema:true,
	attributes:{
		token:{type:'string'},
		expireAt:{type:'date',required:true,date:true},
		user:{model:'User',required:true},
		rol:{type:'string',required:true,enum:['p','m']},
		//p:password reset
		//m:mail verification
		validateToken: function (token, next) {
      bcrypt.compare(token, this.token, next);
    }
	},
	consumeToken:function(token,next){
		var id=token.split(':')[0];
		var data=token.split(':')[1];
		Token.findOne(id).populate('user').exec(function(err,foundToken){
			if(err) return next(err,null);
			if(!foundToken) return next(false,null);
			foundToken.validateToken(data,function(err,success){
				if(err) return next(err,null);
				if(success){
					Token.destroy(id,function(err,destroyed){
						if(err) return next(err,null);
						console.log('destroying');
						return next(foundToken.user,null);
					});
				}else{
					return next(false,null);
				}
			});
		});
	},
  /**
  *
  *Create token for a given user
  *@param {Object} params - Contains the info for the to-be-created token
  *@param {string} params.user - Contains the user id for whom the token will be created
  *@param {string} params.rol - Contains the type of the toke to be created. Must be p(password reset) or m(mail verification)
  */
	createToken:function(params,next){
		var random=shortid.generate();
		params.token=random;
		Token.create(params,function(err,token){
			if(err)return next(err,null);
			var result=token.id+':'+random;
			return next(null,result);
		});
	},
	/**
	 * Callback to be run before creating a Passport.
	 *
	 * @param {Object}   token The soon-to-be-created Passport
	 * @param {Function} next
	*/
	beforeCreate: function (token, next) {
	  hashToken(token, next);
	},

  	/**
  	 * Callback to be run before updating a Passport.
  	 *
   	 * @param {Object}   token Values to be updated
   	 * @param {Function} next
   	 */
	beforeUpdate: function (token, next) {
	   hashToken(token, next);
	}
};
