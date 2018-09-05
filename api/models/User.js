require('date-utils');
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  types: {
    billingInfo:function(info){
      return validate.billingInfo(info);
    }
  },

  attributes: {
    email     : { type: 'email',  unique: true },
    passports : { collection: 'Passport', via: 'user' },
    mailVerified : { type: 'boolean', defaultsTo : false},
    intlCredential : { type: 'string', unique : true},
    firstName : {type : 'string'},
    lastName : {type : 'string'},
    contactInfo: {
      type : 'json',
      defaultsTo:{
        firstName:null,
        lastName:null,
        telephones:[],
        location:{
          latitude:null,
          longitude:null},
          email:null,
          address:null
        }
      },
    autoSub:{type:'boolean',defaultsTo:false},
    tokens : {collection:'Token',via:'user'},
    payments : { collection : 'Payment', via : 'user'},
    payouts : {collection : 'payout',via : 'user'},
    subscribedUntil : {type: 'date',defaultsTo:null,date:true},
    recommender : {type : 'string', defaultsTo : null},
    recommended : {type:'json',defaultsTo:{}},
    maxReco:{type:'int',defaultsTo:3},
    totalBalance : { type:'float'},
    balance : { type : 'array', defaultsTo : []},
    hasBillingInfo:function(){
      var info = this.toObject().billingInfo;
      return validate.billingInfo(info);
    },
    toShort:function(){
      return {
        firstName:this.firstName,
        lastName:this.lastName,
        email:this.email,
        intlCredential:this.intlCredential,
        mailVerified:this.mailVerified,
        recommender:this.recommender
      };
    },
    canRecomend:function(){
      //this change has to be made in order to allow users to recommend indefinitely
      //return Object.keys(this.recommended).length < this.maxRecomended||3;
      return true;
    },
    isSubscribed:function(){
      return this.subscribedUntil==null ? false :  Date.compare(this.subscribedUntil, Date.today()) >= 0;
    }
  },
  afterCreate:function(user,next){
    //mail is verified when a uses signed up using third-party services like facebook
    if(!user.mailVerified){
      var expireAt= (new Date()).add({days:7});
      var tok={user:user.id,rol:'m',expireAt:expireAt};
      Token.createToken(tok,(err,token)=>{
        if(err)return next(err);
        var info={
          url:'https://www.dinabun.com/verifyMail/'+token,
          name:`${user.firstName} ${user.lastName}`
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
  },
  /**
  *
  *Extends a user susbscription for a determined ammount of months
  *
  *@param {string} id - The user's id
  *@param {number} months - Number of months to be added
  *@param {function} next - The function to be executed at the end. Will carry error if is the case
  *
  *
  */
  extendSubscription:function(id,months,next){
    sails.models.user.findOne(id,(err,user)=>{
      if(err)return next(err);
      if(!user) return next(new Error('User does not exiss'));
      var subscribedUntil;
      if(!user.subscribedUntil){
        subscribedUntil= new Date();
      }else{
        subscribedUntil= new Date(user.subscribedUntil);
      }
      subscribedUntil.add({months:months});
      sails.models.user.update(user.id,{subscribedUntil:subscribedUntil},(err,updated)=>{
        if(err)return next(err);
        return next();
      });
    });
  }
};

module.exports = User;
