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
		var params = req.body;
		var query = {};
    console.log(params);
    if(params.hasOwnProperty('salary')&&params.salary>0){
      query['details.salary']={'$gt':params.salary};
    }
    if(params.hasOwnProperty('time')){
      query['details.time']={'$gt':params.time};
    }
    if(params.hasOwnProperty('returnPercentage')&&params.returnPercentage>0){
      query['details.returnPercentage']={'$gt':params.returnPercentage};
    }
    if(params.hasOwnProperty('returnTime')&&params.returnTime>0){
      query['details.returnTime']={'$gt':params.returnTime};;
    }
    if(params.hasOwnProperty('minInvestment')&&params.minInvestment>0){
      query['details.minInvestment']={'$gt':params.minInvestment};;
    }
    if(params.hasOwnProperty('labels')&&params.labels.length>0){
      query.labels={'$in':params.labels};
    }
    //this are not checked so heavily because are expected to come in every request
		if(params.type)query['type'] = params.type;
    if(params.place)query['placesIds'] = params.place;
    console.log(query);
    Post.native((err,collection)=>{
      if(err)return next(err);
      collection.find(query).toArray((err,docs)=>{
        if(err)return next(err);
        docs = docs.map((d)=>{
          d.id=d._id;
          return d;
        });
        return res.json(200,docs);
      });
    });
	},
	singlePost : function(req,res,next){
		Post.findOne(req.body.id).populate('business').exec(function(err,found){
			if(err)return next(err);
			return res.json(200,found);
		});
	}
};
