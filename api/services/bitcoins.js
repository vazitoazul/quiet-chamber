var rp = require('request-promise');
var crypto = require('crypto');
var config = {
  pass:crypto.createHash('md5').update(sails.config.keys.bitcoin.pass).digest("hex"),
  name:sails.config.keys.bitcoin.name,
  secret:sails.config.keys.bitcoin.secret
};
var appUrl = sails.config.keys.appUrl;
function checkRate(callback){
  rp({
    method:'GET',
    uri:'https://www.alfacoins.com/api/rate/btcusd.json',
    json:true
  }).then((data)=>{
    var stripped = data[0].replace(',','');
    callback(null,parseFloat(stripped));
    //return null so the promise wont turn on a runaway promise
    return null;
  }).catch((err)=>{
    callback(err);
    return null;
  });
};
module.exports = {
  createOrder : (user,paymentId,callback)=>{
    checkRate((err,rate)=>{
      var reqBody ={
        "name": config.name,
        "secret_key": config.secret,
        "password" : config.pass,
        "type" : "bitcoin",
        "address" : "33PYu8NfzPHwMfuF953yBwb3aD4HDaKNx5",
        "amount" : (0.01*rate*1.01).toString(),
        "order_id" : paymentId,
        "description": "Pago por subscripción a Dinabun",
        "options" : {
          "notificationURL": appUrl+"/paylistener",
          "redirectURL": appUrl+"/paymentStatus/"+paymentId,
          "payerName": user.firstName + user.lastName,
          "payerEmail": user.email
        }
      };
      rp({
        method:'POST',
        uri:'https://www.alfacoins.com/api/create',
        body:reqBody,
        json:true
      }).then((data)=>{
        callback(null,data);
      }).catch((err)=>{
        callback(err);
      });
    });

  },
  orderStatus:function(txId,callback){
    rp({
      method:'POST',
      uri:'https://www.alfacoins.com/api/status',
      body:{
        name:config.name,
        secret_key:config.secret,
        password:config.pass,
        txn_id:txId
      },
      json:true
    }).then((data)=>{
      callback(null,data);
    }).catch((err)=>{
      callback(err);
    })
  },
  bitSend:function(amount,address,user,callback){
    checkRate((err,rate)=>{
      //convert from satoshis to regular bitcoins
      amount= amount/100000000;
      var reqBody ={
        "name": config.name,
        "secret_key": config.secret,
        "password" : config.pass,
        "type" : "bitcoin",
        "address" : address,
        "amount" : (((amount*0.99)-0.0001)*rate).toString(),
        "recipient_name": user.firstName,
        "recipient_email": user.email,
        "reference":"Payment from Dinabun"
      };
      rp({
        method:'POST',
        uri:'https://www.alfacoins.com/api/bitsend',
        body:reqBody,
        json:true
      }).then((data)=>{
        if(data.error){
          return callback({err:data.error});
        }
        var response={
          txId:data.id
        };
        callback(null,response);
      }).catch((err)=>{
        callback({err:err.message});
      });
    });
  },
  bitsendStatus:function(txId,callback){
    rp({
      method:'POST',
      uri:'https://www.alfacoins.com/api/bitsend_status',
      body:{
        name:config.name,
        secret_key:config.secret,
        password:config.pass,
        bitsend_id:txId
      },
      json:true
    }).then((data)=>{
      if(data.error) {
        return callback(data.error);
      }
      callback(null,data);
    }).catch((err)=>{
      callback(err);
    })
  },
  rate: checkRate

}
