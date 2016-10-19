//User controller

module.exports = {

	current : function(req,res,next){

		User.findOne(req.user.id, function(err, user){
			console.log('el usuario');
			console.log(user);
			if(!user){
				return res.badRequest();
			}

			return res.json(user);
		});
	}

}