/**
 * PaymentController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var paypal = require('paypal-rest-sdk');
paypal.configure(sails.config.paypal);

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
					"cancel_url": sail.config.appUrl+"/cancelPaypal",
					"initial_fail_amount_action": "continue",
					"max_fail_attempts": "2",
					"return_url": sail.config.appUrl+"/returnPaypal",
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
	    if(!req.param('token')){
	      return res.badRequest();
	    }
		paypal.billingAgreement.execute(req.param('token'), {}, function (error, billingAgreement) {
		    if (error) {
		        return next(error);
		    } else {
            Payment.create({user : req.user.id, billingAgreement : billingAgreement.id},function(err,payment){
              if(err){
                return next(err);
              }
              var subscribedUntil = new Date();
              subscribedUntil.setHours(0,0,0,0);
              subscribedUntil.setMonth(subscribedUntil.getMonth() + 1);
              User.update(req.user.id, {subscribedUntil : subscribedUntil }, function(err, updated){
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
	          return next(err);
	      } else {
	          for (var index = 0; index < billingAgreement.links.length; index++) {
	              if (billingAgreement.links[index].rel === 'approval_url') {
	                  var approval_url = billingAgreement.links[index].href;
	                  // See billing_agreements/execute.js to see example for executing agreement
	                  // after you have payment token
					  return res.redirect(approval_url);
	              }
	          }
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
		if(req.body.resource.billing_agreement_id){
		  Payment.find({billingAgreement : req.body.resource.billing_agreement_id},function(err,payment){
		    if(err || !payment[0]){
		      console.log(err);
		      return res.ok();
		    }
		    User.findOne(payment[0].user).populate('payments').exec(function(err,user){
		    	if(err || !user){
				    console.log(err);
		    		return res.ok();
		    	}
		 			var today = new Date();
		 			today.setMonth(today.getMonth() + 1);
		 			today.setHours(0,0,0,0);
		    	if(user.subscribedUntil.valueOf() !== today.valueOf()){
			        Payment.create({user : user.id, billingAgreement :req.body.resource.billing_agreement_id},function(err,payment){
			            if(err){
			              console.log(err);
			              return res.ok();
			            }
			            var newDate = user.subscribedUntil;
			            newDate.setHours(0,0,0,0);
			            newDate.setMonth(newDate.getMonth() + 1);
			            User.update({id : user.id}, {subscribedUntil : newDate }, function(err, updated){
			              if(err || !updated[0]){
			              	console.log(err);
			                return res.ok();
			              }
			              return res.ok();
			            });
			        });
		        }else{
		          return res.ok();
		        }
		    });
		  });

		}else{
		  return res.ok();
		}
	},

	create: function(req,res,next){
		Payment.create({user : req.param('user')},function(err,payment){
		  console.log('yes')
		  console.log(err)
		  return res.json(payment);
	});
	}
};
