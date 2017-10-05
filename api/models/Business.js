/**
 * Business.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 var aws = require('aws-sdk');
 var s3 = new aws.S3({
 	accessKeyId : sails.config.s3.awsKeyId,
 	secretAccessKey : sails.config.s3.awsKeySecret,
 	region : sails.config.s3.region
 });
module.exports = {

  attributes: {
  	user : { type : 'string' , required : true },
  	name : { type : 'string' , required : true},
  	description : { type : 'string' },
  	placesIds : { type : 'array', required : true},
  	cityLabel : { type : 'json', required : true},
    email : { type : 'string' , defaultsTo : ''},
    telephones: { type : 'array' , defaultsTo : []},
    image:{type:'string',defaultsTo:''},
    labels : { type : 'array', defaultsTo : [], required : true},
    posts : { collection : 'post', via : 'business'}
  },

  afterDestroy: (criteria, next)=>{
    // Destroy any post associated to a deleted bussiness
    var deleted = criteria[0];
    Post.destroy({business: deleted.id},(err,destroyed)=>{
      if(err)return next(err);
      if(!deleted.image)return next();
      var params = {
        Bucket : sails.config.s3.bucket,
        Delete : {
          Objects : [{
            Key : deleted.image.split(".com/")[1]
          }]
        }
      }
      s3.deleteObjects(params, (err, data)=>{
        if(err)return next(err); // an error occurred
        Post.destroy({business: deleted.id},(err,destroyed)=>{
          if(err)return next(err);
          return next();
        });
      });
    });
  }
};
