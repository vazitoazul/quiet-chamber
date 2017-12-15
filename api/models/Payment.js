/**
 * Payment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
/**
*
*An object representing a payment in bitcoins
*@typedef {Object} Payment
*@param {string} user - The id of the paying user
*@param {string} txId - The id Alfacoins provide when the order is requested
*@param {string} txStatus - The Alfacoins payment status. One of: new, paid, partially_received, expired, completed or refunded
*@param {boolean} distributed - Wether this payment has been distributed to the user's recommender
*@param {boolean} realized - Wether the payment is completed. This mean that txStatus is completed.
*@param {number} amount - Amount to be paid in satoshis (Bitcoin/100000000)
*@param {url} url - Alfacoins url for the payment
*/

module.exports = {

  attributes: {
    user: { model: 'User', required: true },
    txId : { type: 'string'},
    txStatus: {type:'string', defaultsTo: 'new'},
    distributed : { type: 'boolean', defaultsTo : false },
    realized: {type:'boolean',defaultsTo:false},
    amount: {type:'float'},
    url: {type:'string'},
    automatic: {type:'boolean',defaultsTo:false}

  }
};
