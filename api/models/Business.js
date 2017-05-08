/**
 * Business.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	user : { type : 'string' , required : true },
  	name : { type : 'string' , required : true},
  	description : { type : 'string' },
  	placesIds : { type : 'array', required : true},
  	cityLabel : { type : 'json', required : true},
    email : { type : 'string' , defaultsTo : ''},
    telephones: { type : 'array' , defaultsTo : []},
    labels : { type : 'array', defaultsTo : [], required : true},
    posts : { collection : 'post', via : 'business'}
  },

  beforeDestroy: function(destroyedRecords, next) {
    // Destroy any post associated to a deleted bussiness
    Post.destroy({business: _.pluck(destroyedRecords, 'id')},function(err,destroyed){
      if(err)return next(err);
      return next();
    });
  }
};
