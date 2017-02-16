require('date-utils');
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  types: {
    recommended : (json) => {
      if(Object.keys(json).length > 3){
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
    tokens : {collection:'Token',via:'user'},
    payments : { collection : 'Payment', via : 'user'},
    subscribedUntil : {type: 'date',defaultsTo:null,date:true},
    recommender : {type : 'string', defaultsTo : null},
    recommended : {type:'json',defaultsTo:{}, recommended :true},
    totalBalance : { type:'float'},
    balance : { type : 'array', defaultsTo : []}
  },
  afterCreate:function(user,next){
    //mail is verified when a uses signed up using third-party services like facebook
    if(!user.mailVerified){
      var expireAt= (new Date()).add({days:7});
      var tok={user:user.id,rol:'m',expireAt:expireAt};
      Token.createToken(tok,(err,token)=>{
        if(err)return next(err);
        var info={
          url:'https://dinabun.com/verifyMail/'+token
        };
        var destination = {
          to:user.email,
          subject:'Confirmación de correo'
        };
        mailgun.send('mailVerification',info,destination,(err,result)=>{
          if(err) return next(err);
          next();
        });
      });
    }else{
      next();
    }
  }
};

module.exports = User;
