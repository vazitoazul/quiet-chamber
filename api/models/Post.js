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
    placesIds : { type : 'array'},
    name : { type: 'string', required : true},
    amount : { type: 'float', required : true}
  },

  beforeCreate : function(values,next){
    Business.findOne(values.business,function(err,business){
      if(err) return next(err);
      values.labels = business.labels;
      values.placesIds = business.placesIds;
      return next();
    });
  }
};
