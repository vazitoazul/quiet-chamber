/**
 * Payment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user: { model: 'User', required: true },
    txId : { type: 'string'},
    txStatus: {type:'string', defaultsTo: 'new'},
    distributed : { type: 'boolean', defaultsTo : false },
    realized: {type:'boolean',defaultsTo:false},
    amount: {type:'float'},
    url: {type:'string'}

  }
};
