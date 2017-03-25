/**
 * BusinessController
 *
 * @description :: Server-side logic for managing businesses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/**
    *create a business for the current logged user
    *
		*@param {string} name
		*@param {string} description
		*@param {string} cityLabel - a city name
    *@param {string} placesIds - an array with the ids of each address component
																 on google search
	  *@param {string} labels - an array of category labels
		*@param {string} email - contact email
		*@param {string} telephone - contact telephone
		*/
	createBusiness : function(req,res,next){
		req.body['user'] = req.user.id;
		//set vars that are not sent on form body
		if(req.query['placesIds']){
			req.body['placesIds'] = req.query['placesIds'];
			req.body['labels'] = req.query['labels'];
			req.body['telephones'] = req.query['telephones'];
		}
		Business.create(req.body,function(err,newBusiness){
			if(err)return next(err);
			return res.json(newBusiness);
		});
	},

	/**
		*get the current logged user business
		*
		*/
	getBusiness : function(req,res,next){
		Business.find({user:req.user.id},function(err,business){
			if(err)return next(err);
			return res.json(business);
		});
	},

	/**
    *create a business for the current logged user
    *
		*@param {string} id - uniqe business id
		*@param {string} name
		*@param {string} description
		*@param {string} cityLabel - a city name
    *@param {string} placesIds - an array with the ids of each address component
																 on google search
	  *@param {string} labels - an array of category labels
		*@param {string} email - contact email
		*@param {string} telephone - contact telephone
		*/
	updateBusiness : function(req,res,next){
		var edditing = false;
		var id = req.param('id');
		if(req.query['placesIds']){
			req.body['placesIds'] = req.query['placesIds'];
			req.body['labels'] = req.query['labels'];
		}
		req.body['telephones'] = req.body['telephones'].split(',');
		Business.update({id : id},req.body,function(err,updated){
			if(err)return next(err);
			if(!updated[0])return res.badRequest();
			return res.json(updated[0]);
		});
	}
};
