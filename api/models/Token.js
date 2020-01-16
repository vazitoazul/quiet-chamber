var bcrypt = require('bcryptjs')  ,
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
  /**
  *
  *This callback function handles a token delete
  *
  *@callback tokenDeleteCallback
  *@param {Object} error - Contains an error if something went wrong.
  *@param {string} error.err - Contains a reason why the token failed being validated
  *@param {string} error.tokenNotFound - True if the token wasn't found or was invalid
  *@param {string} result - Contains the tokens owner in case of success null if no token was found
  */
  /**
  *
  *Recieves a token and destroys it in case it's valid
  *@param {string} token - The token to search and destroy
  *@callback {tokenDeleteCallback} next
  */
	consumeToken:function(token,next){
		var id=token.split(':')[0];
		var data=token.split(':')[1];
		Token.findOne(id).populate('user').exec(function(err,foundToken){
			if(err) return next(err,null);
			if(!foundToken) return next({err:'No token were found',tokenNotFound:true});
			foundToken.validateToken(data,function(err,success){
				if(err) return next(err);		
				if(success){
					Token.destroy(id,function(err,destroyed){
						if(err) return next(err);
						return next(null,foundToken.user);
					});
				}else{
					return next({err:'Token invalid',tokenNotFound:true});
				}
			});
		});
	},
  /**
  *
  *Create token for a given user
  *@param {Object} params - Contains the info for the to-be-created token
  *@param {string} params.user - Contains the user id for whom the token will be created
  *@param {Date} params.expireAt - The date until the token will be valid
  *@param {string} params.rol - Contains the type of the toke to be created. Must be p(password reset) or m(mail verification)
  *@param {Function} next -
  */
	createToken:function(params,next){
		var random=shortid.generate();
		params.token=random;
		Token.create(params,function(err,token){
			if(err)return next(err,null);
			var result=token.id+':'+random;
      //the resulting token which is going to be sent to the user
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
