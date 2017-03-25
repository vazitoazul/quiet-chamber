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
		*/
	createPost: function(req,res,next){

		Post.create(req.body,function(err,newPost){
			console.log(err,newPost);
			if(err)return next(err);
			return res.json(newPost);
		});
	},
};
