/**
 * Post.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    business : { model : 'business', required : true },
    type : { type : 'string', required : true},
    description : {type : 'string', required : true},
    labels : { type : 'array', defaultsTo : []},
    placesIds : { type : 'array'}
  },

  beforeCreate : function(values,next){
    console.log(values)
    Business.findOne(values.business,function(err,business){
      if(err) return next(err);
      values.labels = business.labels;
      values.placesIds = business.placesIds;
      return next();
    });
  }
};
