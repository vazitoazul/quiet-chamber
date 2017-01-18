require('date-utils');
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  types: {
    recommended : (json) => {
      if(Object.keys(json).length > 4){
        return false;
      }
      return true;
    }
  },

  attributes: {
    email     : { type: 'email',  unique: true },
    passports : { collection: 'Passport', via: 'user' },
    mailVerified : { type: 'boolean', defaultsTo : false},
    intlCredential : { type: 'string', unique : true},
    firstName : {type : 'string'},
    lastName : {type : 'string'},
    contactInfo: {type : 'json',defaultsTo:{firstName:null,lastName:null,telephones:[],location:{latitude:null,longitude:null},email:null,address:null}},
    payments : { collection : 'Payment', via : 'user'},
    subscribedUntil : {type: 'date',defaultsTo:null,date:true},
    recommender : {type : 'string', defaultsTo : null},
    recommended : {type:'json',defaultsTo:{}, recommended :true}
  }
};

module.exports = User;
