var rp = require('request-promise');
var crypto = require('crypto');
var config = {
  pass:crypto.createHash('md5').update(sails.config.keys.bitcoin.pass).digest("hex"),
  name:sails.config.keys.bitcoin.name,
  secret:sails.config.keys.bitcoin.secret
}
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
      console.log(rate);
      var reqBody ={
        "name": config.name,
        "secret_key": config.secret,
        "password" : config.pass,
        "type" : "bitcoin",
        "address" : "33PYu8NfzPHwMfuF953yBwb3aD4HDaKNx5",
        "amount" : (0.0101*rate).toString(),
        "order_id" : paymentId,
        "description": "Pago por subscripción a Dinabun",
        "options" : {
          "notificationURL": "http://a0d756fe.ngrok.io/paylistener",
          "redirectURL": "http://a0d756fe.ngrok.io/pas",
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
  }

}
