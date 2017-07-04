/**
 * PostController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	/**
		*create a post for certain business
		*
		*@param {string} description
		*@param {string} business - the business id
		*@param {string} description
		*@param {string} type - post type
		*/
	createPost: function(req,res,next){
		Post.create(req.body,function(err,newPost){
			if(err)return next(err);
			return res.json(newPost);
		});
	},
	/**
    *create a business post for the current logged user
    *
		*@param {string} id - uniqe business id
		*@param {string} description
		*@param {string} type - post type
		*@param {string} business - the post business id
		*/
	updatePost : function(req,res,next){
		Post.update({id : req.param('id')},req.body,function(err,updated){
			if(err)return next(err);
			if(!updated[0])return res.badRequest();
			return res.json(updated[0]);
		});
	},
	/**
    *delete a user business post
    *
		*@param {string} id - uniqe post id
		*/
	deletePost : function(req,res,next){
		Post.destroy({id : req.param('id')},function(err,deleted){
			if(err)return next(err);
			return res.json(deleted[0]);
		});
	},
		/**
			*search posts
			*
			*@param {string} labels - post labels
			*@param {string} amountFrom - post amunt
			*@param {string} amountTo - post amunt
			*@param {string} location - post location
			*@param {string} type - post type
			*/
	searchPosts : function(req,res,next){
		var params = req.allParams();
		var query = {};
		const labels = params.labels;
		const places = params.location;
		if(labels&&labels.length>0){
			query['$or']=[];
			for(var label in labels){
				query['$or'].push({'labels' : labels[label]});
			}
		}
		if(places&&places.length>0){
			query['$or']= query['$or'] || [];
			for(var place in places){
				query['$or'].push({'placesIds' : places[place]});
			}
		}
		if(params.amountTo || params.amountFrom)query['amount']= {};
		if(params.amountFrom)query['amount'].$gt = parseInt(params.amountFrom);
		if(params.amountTo)query['amount'].$lte = parseInt(params.amountTo);
		if(params.type)query['type'] = params.type;
		Post.find(query).populate('business').exec(function(err,found){
			if(err)return next(err);
			return res.json(200,found);
		});
	}
};
