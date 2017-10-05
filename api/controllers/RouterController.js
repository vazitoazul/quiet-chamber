/**
 * RouterController
 *
 * @description :: Server-side logic for managing Routers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
	/**
	* render homepage view to and it render some polymer fragment depening on the page name
	*
	*@param {String} page
	*/
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

