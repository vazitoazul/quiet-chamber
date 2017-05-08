/**
 * PaymentController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var paypal = require('paypal-rest-sdk'),
		random = require('randomstring');
paypal.configure(sails.config.paypal);
var ipn = require('pp-ipn');

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
/**
*Creates and activates a billing plan using papal rest api.
*
*@param {function} next - callback function
*/
var createAndActivePayPalBillingPlan = function(next){
	var billingPlanAttributes = {
			"name" : "The test plan",
			"description": "Create test plan for Regular",
			"merchant_preferences": {
					"auto_bill_amount": "yes",
					"initial_fail_amount_action": "continue",
					"max_fail_attempts": "2",
					"setup_fee": {
							"currency": "USD",
							"value": "2"
					}
			},
			"payment_definitions": [
					{
							"amount": {
									"currency": "USD",
									"value": "2.00"
							},
							"cycles": "0",
							"frequency": "DAY",
							"frequency_interval": "1",
							"name": "Pago del test",
							"type": "REGULAR"
					}
			],
			"type": "INFINITE"
	};
	paypal.billingPlan.create(billingPlanAttributes, function (error, billingPlan) {
			if (error) {
					console.log(error);
					throw error;
			} else {
					var billing_plan_update_attributes = [
					    {
					        'op': 'replace',
									'path' : '/',
					        'value': {
					            'state': 'ACTIVE'
					        }
					    }
					]
					//activating the plan
					paypal.billingPlan.update(billingPlan.id, billing_plan_update_attributes, function (error, response) {
							if (error) {
									console.log(error.response);
									throw error;
							} else {
								console.log(response);
								return next(billingPlan);
							}
					});
			}
	});
};


module.exports = {
	/**
	*Exucte the payment once the user accepted the billing agreement.
	*Create a new payment with the billing agreement id and redirect the user to payment aproved page
	*
	*
	*@param {String} token - paypal token.
	*/
	returnPayment : function(req,res,next){
		var token = req.param('token')||req.body.payToken;
    if(!token){
      return res.badRequest();
    }
		paypal.billingAgreement.execute(token, {}, function (error, billingAgreement) {
		    if (error) {
		        return next(error);
		    } else {
					console.log(JSON.stringify(billingAgreement,null,4));
						var amount = 0;
						billingAgreement.plan.payment_definitions.forEach((item)=>{
							amount+= parseFloat(item.amount.value);
							if(item.charge_models){
								item.charge_models.forEach((model)=>{
									amount+= parseFloat(model.amount.value);
								});
							}
						});
						amount = parseFloat(amount.toFixed(2));
						console.log(typeof amount);
            Payment.create({user : req.user.id, billingAgreement : billingAgreement.id,amount:amount},function(err,payment){
              if(err){
                return next(err);
              }
              var subscribedUntil = new Date();
              subscribedUntil.setHours(0,0,0,0);
              subscribedUntil.setMonth(subscribedUntil.getMonth() + 1);
              User.update(req.user.id, {subscribedUntil : subscribedUntil,paypalInfo:billingAgreement.payer.payer_info}, function(err, updated){
                if(err){
                  throw err;
                }
                return res.redirect("/papr");
              });
            });
		    }
		});
	},
	/**
	*Redirect user to a cancel payment page.
	*
	*/
	cancelPayment : function(req,res,next){
   		return res.redirect('/acco/membership');
	},
	/**
	*Create a billing agreement with paypal rest api and redirect the user to the aproval url.
	*
	*
	*
	*@param {String} token - paypal token.
	*/
	setExpressCheckout : function(req,res,next){
		var isoDate = new Date();
		isoDate.setSeconds(isoDate.getSeconds() + 60);
		isoDate.toISOString().slice(0, 19) + 'Z';
		var billingAgreementAttributes = {
		    "name": "Subcripcion para la pagina",
		    "description": "Acuerdo para subcripcion a la pagina",
		    "start_date": isoDate,
		    "plan": {
          		"id": sails.config.paypal.billingPlanId
		    },
		    "payer": {
		        "payment_method": "paypal"
		    }
		};
		paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
	      if (error) {
	        return next(error);
	      }
				if (billingAgreement.links[0].rel === 'approval_url') {
          var url = billingAgreement.links[0].href;
          var params = parseQuery(url);
          res.ok({payToken: params['token']});
        }else{
					res.badRequest();
				}
	  	});
	},
	/**
	*Listen to a paypal call and look for any payment with the same billing agreement id. Cheks if it is not the first call, becouse it will overwrite a payment
	*then updates the user linked to it, with one month more of subscription.
	*
	*
	*@param {String} token - paypal token.
	*/
	ipnListener : function(req,res,next){
		console.log(req.body);
		res.ok();
		ipn.verify(req.body, {'allow_sandbox': true}, function callback(err, mes) {
		  if(err){
				logger.error({message:'IPN not verified',err:err,verifMessage:mes,body:req.body});
			}else{
				console.log(mes);
				console.log('IPNACCEPTED');
				switch (req.body.txn_type) {
					case 'recurring_payment':
						//Find another payment with this recurring_payment_id to get the user that made this payment
						Payment.findOne({billingAgreement:req.body.recurring_payment_id},function(err,payment){
							if(err){
								logger.error({message:'IPN Failed to complete',err:err,body:req.body});
							}else{
								if(!payment){
									logger.error({message:'IPN listener failed to find last payment',err:err,body:req.body})
								}else{
									User.extendSubscription(payment.user,1,(err)=>{
										if(err){
											logger.error({message:'IPN Failed to extend users subscription',err:err,body:req.body});
										}else{
											Payment.create({user:payment.user,amount:parseFloat(req.body.amount),billingAgreement:req.body.recurring_payment_id},(err,newPayment)=>{
												if(err){
													logger.error({message:'IPN listener Failed to create the payment',err:err,body:req.body});
												}
												return ;
											});
										}
									});
								}
							}
						});
						break;

				}
			}
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
	*Sends a payment throug paypal payouts API
	*
	*
	*
	*
	*/
	createPayout:function(req,res,next){
		if(!req.body.amount) return res.json(409,{error:'invalid_amount'})
		User.findOne(req.user.id,(err,user)=>{
			if(!user.paypalInfo){
				return res.json(400,{error:'no_pp_account'});
			}
			var payout = {
		    "sender_batch_header": {
		        "sender_batch_id": random.generate(9),
		        "email_subject": "You have a payment"
		    },
		    "items": [
		        {
		            "recipient_type": "PAYPAL_ID",
		            "amount": {
		                "value": req.body.amount.toFixed(2),
		                "currency": "USD"
		            },
		            "receiver": user.paypalInfo.payer_id,
		            "note": "Pago de comisiones"
		        }
		    ]
			};
			paypal.payout.create(payout,(err,payout)=>{
				if(err) return next({error:'unable_to_pay'});
				Payout.create({user:user.id,payPalData:payout,amount:req.body.amount},(err,created)=>{
					if(err) return next(err);
					return res.ok();
				});
			});

		});

	},
	/**
	*
	*Check if a user exists in my paypal Clients and gets all the info needed to send him a payment
	*
	*
	*
	*/
	getPayoutState:function(req,res,next){
		User.findOne(req.user.id).populate('payouts',{payed:false}).exec((err,user)=>{
			if(err)return next(err);
			if(user.payouts[0]){
				return res.ok({canRequestPayout:false});
			}else{
				return res.ok({canRequestPayout:true});
			}
		});
	}



};
