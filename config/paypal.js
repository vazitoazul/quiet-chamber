module.exports.paypal={
	mode :  process.env.PAYPAL_MODE || 'live' , 
	client_id : process.env.PAYPAL_CLIENT_ID,
	client_secret : process.env.PAYPAL_CLIENT_SECRET,
	billingPlanId : process.env.PAYPAL_BILLINGPLAN_ID,
};
