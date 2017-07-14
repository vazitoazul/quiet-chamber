/**
 * PaymentController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var blockIo = require('block_io'),
    block = new blockIo(sails.config.keys.blockIoKey,sails.config.keys.blockIoPin,2),
		random = require('randomstring');

/**
*
* Gets a url and parses it's parameters
*
*@param {string} qstr - Url that contains the query
*@returns {object[]}  objects with the form {key : value}
*
*/
function parseQuery(qstr) {
	var query = {};
  var a = qstr.substr(1).split('&');
  for (var i = 0; i < a.length; i++) {
      var b = a[i].split('=');
      query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return query;
}



module.exports = {
	/**
	*
	*Creates a new wallet address for the user
	*
	*
	*/
	requestOrder:function(req,res,next){
    var user = req.user;
    Payment.create({user:user.id},(err,payment)=>{
      if(err) return next(err);
      bitcoins.createOrder(user,payment.id,(err,response)=>{
        if(err) return next(err);
        payment.amount=Math.ceil((parseFloat(response.coin_amount))*100000000);
        payment.txId=response.id;
        payment.url=response.url;
        payment.save((err)=>{
          if(err){return next(err)};
          res.redirect(response.url);
        });
      });
    });
  },
	/**
	*
	*Gets all the payments for the current user
	*
	*
	*/
	getAll: function(req,res,next){
		User.findOne(req.user.id).populate('payments').exec((err,user)=>{
			if(err)return next(err);
			res.json({payments:user.payments});
		});
	},
  /**
  *
  *Listener for the Alfacoins calls on payments/orders updates
  *
  *
  */
  paymentListener: function(req,res,next){
    //Chech if alfacoins is the one doing the calls
    if(req.headers['user-agent']!=='ALFAcoins (+https://alfacoins.com)'){
      return res.forbidden();
    }
    console.log('paymentListener',req.body);
    //Find the payment related
    Payment.find(req.body.order_id,(err,payment)=>{
      if(err){
        console.log('paymentListenerError',err);
        return res.ok();
      }
      if(!payment){
        console.log('paymentListenerError',{error:'payment_not_found'});
        return res.ok();
      }
      //Update the payment txStatus
      payment.txStatus=req.body.status;
      //Check payment status
      if(payment.txStatus==='completed'){
        //If payment was succesfully completed then update the user and credit
        //him with one month of subscription
        User.extendSubscription(payment.user,1,(err)=>{
          if(err){
            console.log('paymentListenerError',{error:'user_not_updated'});
            return res.ok();
          }
          payment.realized=true;
          payment.save((err)=>{
            if(err){
              console.log('paymentListenerError',{error:'payment_not_saved'});
            }
            return res.ok();
          });
        });
      }else{
        //If not just save the payment
        payment.save((err)=>{
          if(err){
            console.log('paymentListenerError',{error:'payment_not_saved'});
          }
          return res.ok();
        });
      }
    });
  }
};
