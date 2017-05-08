/**
 * Payment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: { model: 'User', required: true },
    billingAgreement : { type: 'string'},
    confirmed : { type: 'boolean', defaultsTo : false },
    bill : { model: 'bill'},
    amount: {type:'float',required:true }
  }
};
