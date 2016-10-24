/**
 * RouterController
 *
 * @description :: Server-side logic for managing Routers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {


	redirect:function(req,res,next){
		var page = req.params.page;	
		//check if page exists

		if(page){
			//check if no src is requested 
			if(page==='src'){
				return next();
			}
			//if a valid route is requested return index.html using homepage view
			if(page.length < 5){
				res.locals.layout='';
				return res.view('homepage');
			}
		}
		//nothing happens keep down the stream, normally to get an asset
		return next();	
	}

};

