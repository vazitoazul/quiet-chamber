/**
 * PaymentController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AfXER6G2HrtY7mqqupTTw3NgPCTgavJYdypxLVzwmwtMn7iARBz51ClX7sOKaIMFiFeLMH8e_ACeq-BJ',
  'client_secret': 'EL0Qp_5jaDcHmoS1pv6Hr1LkXkMhzk37EEmWGbKRE3h_wauEu0RNI5Y0pv9L33i20aRsIQkhNFB_Tenp',
	'planId' : 'P-5G065982F24424329RUIIYAA'
});

var createAndActivePayPalBillingPlan = function(next){
	var billingPlanAttributes = {
			"name" : "The test plan",
			"description": "Create test plan for Regular",
			"merchant_preferences": {
					"auto_bill_amount": "yes",
					"cancel_url": "http://localhost:1337/cancelPaypal",
					"initial_fail_amount_action": "continue",
					"max_fail_attempts": "2",
					"return_url": "http://localhost:1337/returnPaypal",
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
							"frequency": "MONTH",
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
					console.log(billingPlan.id);
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

	returnPayment : function(req,res,next){
	    if(!req.param('token')){
	      return res.badRequest();
	    }
		paypal.billingAgreement.execute(req.param('token'), {}, function (error, billingAgreement) {
		    if (error) {
		        console.log(error);
		        throw error;
		    } else {
		        console.log("Billing Agreement Execute Response");
		        console.log(JSON.stringify(billingAgreement));
            return res.redirect("/papr");
		    }
		});
	},

	cancelPayment : function(req,res,next){
		console.log('canceled');
		return next();
	},

	setExpressCheckout : function(req,res,next){
		var isoDate = new Date();
		isoDate.setSeconds(isoDate.getSeconds() + 60);
		isoDate.toISOString().slice(0, 19) + 'Z';
		var billingAgreementAttributes = {
		    "name": "Subcripcion para la pagina",
		    "description": "Acuerdo para subcripcion a la page",
		    "start_date": isoDate,
		    "plan": {
		        "id": "P-5G065982F24424329RUIIYAA"
		    },
		    "payer": {
		        "payment_method": "paypal"
		    }
		};
		paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
	      if (error) {
	          console.log(error.response.details);
	          throw error;
	      } else {
	          console.log("Create Billing Agreement Response");
	          for (var index = 0; index < billingAgreement.links.length; index++) {
	              if (billingAgreement.links[index].rel === 'approval_url') {
	                  var approval_url = billingAgreement.links[index].href;
	                  console.log("For approving subscription via Paypal, first redirect user to");
	                  console.log(approval_url);
	                  // See billing_agreements/execute.js to see example for executing agreement
	                  // after you have payment token
					  return res.redirect(approval_url);
	              }
	          }
	      }
	  });
	},

  ipnListener : function(req,res,next){
    console.log("LISTENER");
    console.log(req.body);
    console.log(req);
    return res.ok();
  }
};