/**
 * RouterController
 *
 * @description :: Server-side logic for managing Routers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	route:function(req,res,next){
		if(req.url=='/account'){
			res.location('/view3')
			return res.redirect('/?param=hola');
		}
		
	}
};

