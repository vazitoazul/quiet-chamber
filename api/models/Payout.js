
module.exports = {
    attributes:{
      payPalData:{type:'json',defaultsTo:null},
      user:{ model: 'User', required: true },
      payed:{type:'boolean',defaultsTo:false},
      status:{type:'string',defaultsTo:null},
      amount:{type:'float',required:true}
    }
};
