var fs = require('fs');
const finalConsBI={
  name:'Consumidor Final',
  identifier: '9999999999999',
  idType:'07'
};
module.exports={
    test: function(req,res,next){
      var detail= {
        items:[
          {qty:1,
          description:'Subscripción Dinabun',
          code:'SUB01',
          unitPrice:15.00,
          discount:0,
          total:15.00,
          taxes:[
            {rate:0.14,
             name:'IVA',
             code:'2',
             rateCode:'3'
            }
            ]
          }
        ],
      total: 17.10
      };
      var billingInfo = {
        name:'Juan Rosero',
        identifier: '0401584909',
        address:'Los laureles y los Mortiños',
        idType:'05',
        email:'jfrosero@udlanet.ec'
      };
      var bill = {
        billingInfo : billingInfo,
        detail:detail
      };
      Bill.create(bill,(err,created)=>{
        if(err) return next(err);
        res.ok(err||created);
      });
    },
    auttest:function(req,res,next){
      Bill.authorizeBill(req.param('id'),function(err){
        res.ok(err||'todobien');
      });
    },
    /**
    *
    *Receives a bill Id and retrives it's corresponding xml authorized file. In case the bill hasn't been authorized, returns a badRequest
    *
    *@param {string} id - The bill's Id
    */
    getXml:function(req,res,next){
      Bill.findOne(req.param('id'),(err,found)=>{
        if(err)return next(err);
        if(!found) return res.badRequest();
        var name= found.billingInfo.name+found.createdAt+'.xml';
				res.setHeader('Content-disposition', 'attachment; filename=' + name );
  			res.setHeader('Content-type', 'text/xml');
				res.send(found.signedVersion);
      });
    },
    /**
    *
    *Receives a bill Id and retrives it's corresponding pdf. In case the bill hasn't been authorized, returns a badRequest
    *
    *@param {string} id - The bill's Id
    */
    getPdf:function(req,res,next){
      Bill.findOne(req.param('id'),(err,found)=>{
        if(err)return next(err);
        if(!found) return res.badRequest();
        var data={};
        data.bill=found.toSRIFormat().factura;
        data.bill.autNumber=found.autNumber;
        data.bill.email=found.billingInfo.email;
        data.bill.address=found.billingInfo.address;
        data.logo='file:///'+path.resolve(__dirname,'../../images/logo.png');
        var name= found.billingInfo.name+found.createdAt+'.pdf';
        pdf.generateFactura(data,(err,result)=>{
          if(err)return next(err);
          res.setHeader('Content-disposition', 'attachment; filename=' + name );
    			res.setHeader('Content-type', 'application/pdf');
  				var stream = fs.createReadStream(result.filename, {bufferSize: 64 * 1024});
        	stream.pipe(res);
        	var had_error = false;
        	stream.on('error', function(err){
          	had_error = true;
        	});
        	stream.on('close', function(){
         	 if (!had_error) fs.unlink(result.filename);
        	});
        });
      });
    },
    /**
    *
    *Gets all the bills for currently logged user
    *
    */
    getAll:function(req,res,next){
      Bill.find({user:req.user.id},(err,found)=>{
        if(err)return next(err);
        res.ok({bills:found});
      });
    },
    /**
    *
    *Creates a new bill from a list of payments. This are supposed to belong to a plan payment (SUB01)
    *The bill gets created with the current user paymentInfo. In case of missing this info, final cosumer info is used.
    *
    *@param {array} payments - The payments
    *
    */
    createBillForPlanPayments:function(req,res,next){
      Payment.find(req.body.payments,(err,found)=>{

        if(err) return next(err);
        if(found.length!==req.body.payments.length) return res.json(409,{error:'nonexisting_payments'});
        User.findOne(req.user.id,(err,user)=>{
          if(err) return next(err);
          var newBill={};
          if(user.hasBillingInfo()){
            newBill.billingInfo=user.billingInfo;
          }else{
            newBill.billingInfo=finalConsBI;
          }
          newBill.detail= {
            items:[
              {qty:found.length,
              description:'Subscripción Dinabun',
              code:'SUB01',
              unitPrice:15.00,
              discount:0,
              total:15.00*found.length,
              taxes:[
                {rate:0.14,
                 name:'IVA',
                 code:'2',
                 rateCode:'3'
                }
                ]
              }
            ],
          total: 1.14*(15.00*found.length)
          };
          newBill.user=req.user.id;
          Bill.create(newBill,(err,created)=>{
            if(err) return next(err);
            Payment.update(req.body.payments,{bill:created.id},(err,updatedPays)=>{
              if(err) return next(err);
              res.ok({bill:created});
            });
          });
        });
      });

    }
}
