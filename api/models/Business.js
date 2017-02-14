/**
 * Business.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	user : { type : 'string' , required : true },
  	name : { type : 'string' },
  	description : { type : 'string' },
  	type : { type : 'array' , required : true},
  	location : { type : 'json'},
  	requiredFounds : { type : 'number'},
  	actualFounrds : { type : 'number'}, 
  	contactInfo : { type : 'json' , defaultsTo : { email : '', telephone: ''}}
  }
};

