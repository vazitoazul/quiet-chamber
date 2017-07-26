
module.exports = {
    attributes:{
      user:{ model: 'User', required: true },
      payed:{type:'boolean',defaultsTo:false},
      amount:{type:'float',required:true},
      fee:{type:'float',required:true},
      address:{type:'string',required:true},
      txId:{type:'string'}

    }
};
