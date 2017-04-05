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
	}

};
