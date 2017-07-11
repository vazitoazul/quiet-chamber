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
	requestWallet:function(req,res,next){
    User.findOne(req.user.id,(err,user)=>{
      if(err)return next(err);
      //If the user has a wallet already we should not create one
      if(user.walletAddress){
        return res.json(409,{error:'user_has_wallet'});
      }
      //MISSING : Verificar que la dirección no haya sido creada anteriormente
      block.get_new_address({'label':req.user.id},(err,result)=>{
        if(err) return next(err);
        if(result.status!=='success'){
          return res.json(500,{error:'bitcoin_network_error'});
        }
        User.update(req.user.id,{walletAddress:result.data.address},(err,updated)=>{
          if(err)return next(err);

        });
        res.ok({address:result.data.address});
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
	*Sends a payment throug paypal payouts API
	*
	*
	*
	*
	*/
	createPayout:function(req,res,next){


	},
	/**
	*
	*Check if a user exists in my paypal Clients and gets all the info needed to send him a payment
	*
	*
	*
	*/
	getPayoutState:function(req,res,next){

	}



};
