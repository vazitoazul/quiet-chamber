/**
 * Post.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    business : { model : 'business', required : true },
    type : { type : 'string', required : true,enum:['i','d','j']},
    labels : { type : 'array', defaultsTo : []},
    placesIds : { type : 'array',defaultsTo:[]},
    cityLabel : { type : 'string',required:true},
    /*
    *details object contains info about a specific post. Fields vary according to post type.
    *Fields inside details are listed below:
    *
    * d(donation) : description, reason, minDonation
    * i(investment) : description, reason, minInvestment, returnPercentage, returnTime
    * j(job) : description, requirements, salary, time( m(monthly), w(weekly), h(hourly) )
    *
    */
    details:{type:'json',defaultsTo:{}},

    name : { type: 'string', required : true}
  },

  beforeCreate : function(values,next){
    Business.findOne(values.business,function(err,business){
      if(err) return next(err);
      values.labels = business.labels;
      return next();
    });
  }

};
