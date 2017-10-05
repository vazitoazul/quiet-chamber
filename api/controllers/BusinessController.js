/**
 * BusinessController
 *
 * @description :: Server-side logic for managing businesses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var aws = require('aws-sdk');
 var s3 = new aws.S3({
 	accessKeyId : sails.config.s3.awsKeyId,
 	secretAccessKey : sails.config.s3.awsKeySecret,
 	region : sails.config.s3.region
 });

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
		var business = req.body.business;
		business['user'] = req.user.id;
		Business.create(business,function(err,newBusiness){
			if(err)return next(err);
			business['id'] = newBusiness.id;
			return res.json(200,business);
		});
	},

	/**
		*get the current logged user business
		*
		*/
	getBusiness : function(req,res,next){
		Business.find({user:req.user.id}).populate('posts').exec(function(err,business){
			if(err)return next(err);
			return res.json(business);
		});
	},
	/**
    *Update a business given data and the id
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
		var id = req.param('id');
		Business.update({id : id},req.body,function(err,updated){
			if(err)return next(err);
			if(!updated[0])return res.badRequest();
      //Also update all the ascociated posts with the corresponding labels
      Post.update({business:updated[0].id},{labels:updated[0].labels},(err,updatedPosts)=>{
        if(err)return next(err);
        return res.json(updated[0]);
      })	
		});
	},
	/**
    *delete a user business
    *
		*@param {string} id - uniqe business id
		*/
	deleteBusiness : function(req,res,next){
		Business.destroy({id : req.param('id')},function(err,deleted){
			if(err)return next(err);
			return res.json(deleted[0]);
		});
	},
	/**
    *sign aws s3 url
    *
		*@param {string} file - file name
		*@param {string} type - file type
		*/
	signAwsUrl : (req,res,next)=>{
		const bucket = sails.config.s3.bucket;
		const fileName = req.param('file');
		const s3Params = {
			Bucket: bucket,
			Key: fileName,
			Expires: 60,
			ContentType: req.param('type'),
			ACL: 'public-read'
		};
		s3.getSignedUrl('putObject', s3Params, (err, data) => {
			if(err)return next(err);
			return res.json({
				signedRequest: data,
				url: `https://${bucket}.s3.amazonaws.com/${fileName}`
			});
		});
	},
	/**
    *delete image from aws s3
    *
		*@param {string} id - business id with the image to delete
		*/
	deleteBusinessImage :function(req,res,next){
		Business.findOne({id : req.param('id')},function(err,business){
			if(err)return next(err);
			var params = {
				Bucket : sails.config.s3.bucket,
				Delete : {
					Objects : [{
						Key : business.image.split(".com/")[1]
					}]
				}
			}
			s3.deleteObjects(params, function(err, data) {
				if(err)return next(err); // an error occurred
        Business.update({id : business.id},{image : ''}, (err,updated)=>{
          if(err) return next(err);
          return res.json(updated[0]);
        });
			});
		});
	}

};
