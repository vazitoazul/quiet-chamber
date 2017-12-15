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
    Payment.find({user:req.user.id,txStatus:['new','paid']},(err,previous)=>{
      if(err) return next(err);
      if(previous[0]){
        return res.redirect('/paymentStatus/'+previous[0].id);
      }else{
        Payment.create({user:user.id},(err,payment)=>{
          if(err) return next(err);
          bitcoins.createOrder(user,payment.id,(err,response)=>{
            if(err) return next(err);
            payment.amount=Math.ceil((parseFloat(response.coin_amount))*100000000);
            payment.txId=response.id;
            payment.url=response.url;
            payment.save((err)=>{
              if(err){return next(err)};
              console.log(response);
              res.redirect(response.url);
            });
          });
        });
      }

    });

  },
  requestPayout:function(req,res,next){
    var user = req.user;
    if(!req.body.amount||!req.body.address){
      return res.json(409,{error: 'missing_arguments'});
    }
    var amount =req.body.amount;
    if(typeof amount ==='string'){
      amount = parseFloat(amount);
    }
    var detail={
      user:user.id,
      amount: amount,
      fee:(amount*0.01)+10000,
      address:req.body.address
    };
    var total=detail.amount+detail.fee;
    User.findOne(user.id,(err,user)=>{
      if(err)return res.json(500,{error:'server_error'});
      var available = user.balance.reduce((res,val)=>{
        return res+val;
      },0);
      if(total>available){
        return res.json(409,{error:'balance_not_available'});
      }
      Payout.findOne({user:user.id},(err,lastPayout)=>{
        if(err)return res.json(500,{error:'server_error'});
        if(lastPayout)return res.json(409,{error:'payout_already_requested'});
        Payout.create(detail,function(err,newPayout){
          if(err) return res.json(500,{error:'server_error'});
          bitcoins.bitSend(detail.amount,detail.address,user,function(err,response){
            if(err){
              Payout.destroy({id:newPayout.id},function(err,deleted){
                if(err) console.log('Error deleting payout on alfacoin fail',err);
                return res.json(500,{error:'network_fail'});
              });
            }else{
              Payout.update({id:newPayout.id},{txId:response.txId},function(err,updated){
                if(err){
                  console.log('Error updating payout transaction Id');
                  return res.json(500,{error:'server_error'});
                }
                res.json(updated[0]);
              });
            }
          });
        });
      });
    });

  },
  /**
  *
  *Get bitcoin rate
  *
  */
  rate:function(req,res,next){
    bitcoins.rate((err,rate)=>{
      if(err)return next(err);
      res.json(rate);
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
  paymentStatus:function(req,res,next){
    if(!req.param('id'))return res.json(409,{error:'missing_payment_id'});
    Payment.findOne(req.param('id'),(err,payment)=>{
      if(err)return next(err);
      if(!payment)return res.json(404,{error:'payment_not_found'});
      if(payment.txStatus==='new'){
        return res.redirect(`/pas/${payment.txStatus}?url=${encodeURIComponent(payment.url)}`)
      }else{
        return res.redirect(`/pas/${payment.txStatus}`);
      }

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
    Payment.findOne(req.body.order_id,(err,payment)=>{
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
        User.extendSubscription(payment.user,12,(err)=>{
          if(err){
            console.log('paymentListenerError',{error:'user_not_updated'});
            return res.ok();
          }
          Payment.update({id:payment.id},{realized:true,txStatus:payment.txStatus},(err,updated)=>{
            if(err){
              console.log('paymentListenerError',{error:'payment_not_saved'});
            }
            return res.ok();
          });
        });
      }else{
        //If not just save the payment
        Payment.update({id:payment.id},{txStatus:payment.txStatus},(err,updated)=>{
          if(err){
            console.log('paymentListenerError',{error:'payment_not_saved'});
          }
          return res.ok();
        });
      }
    });
  }
};
