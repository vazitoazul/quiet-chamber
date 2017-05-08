require('date-utils');
var random = require('randomstring');
var billInfo=sails.config.bills;
/**
* Returns the corresponding digit 11 of a n input
*
*@param {string} n - The string numbers from which the digit11 digit will be calculated
*/
function digit11(n) {
  var l = n.length, i = 0, j = 1+l%6, v = 0;
  if(j===1)j=7;
  for(i = 0, i <= l-1; i < l; i++) {
    v += parseInt(n[i]) * j;
    j = (j == 2) ? 7 : --j;
  }
  var mod = (11 - (v%11));
  if(mod===10)mod=1;
  if(mod===11)mod=0;
  return mod;
};
/**
* Returns a the n string padded with the z character until width is reached
*
*@param {string} n - The original string
*@param {string} width - The desired width of the string
*@param {?string} z - The character used to fill the gaps
*
*/
function pad(n, width, z=0) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
/**
*
*Object describing a tax rate. Uses the standar defined by SRI.
*More info on http://www.sri.gob.ec/DocumentosAlfrescoPortlet/descargar/fbb05cf5-32f2-4cc3-bc8a-b539c9e0ed74/FICHA+TECNICA+COMPROBANTES+ELECTRO%B4NICOS+offline.pdf
*
*@typedef {Object} Tax
*@property {!number} rate - rate related with the tax. Between 1 and 0.
*@property {!string} name - name of the tax
*@property {!string} code - SRI code used for this tax
*@property {!string} rateCode - SRI code used to identify tax rate
*/
/**
*
*Object describing a single item inside a bill's Detail
*@typedef {Object} Item
*@property {!number} qty - How manny of this items
*@property {!string} description - Description for the item
*@property {!string} code - Main code for this item, Must be unique for each type of item
*@property {?string} altCode - Alternative code for this item
*@property {!number} unitPrice - Price for each item
*@property {?number} discount - Discount applied to the current item. It's applied as a whole, not to the unitPrice
*@property {number} total - Calculated value equal to qty*unitPrice - discount
*@property {Tax[]} taxes - Array con2aining Taxes applied to the current item
*/
/**
*
*An object describing the purchase.
*@typedef {Object} Detail
*@property {!Item[]} items - Items included into the current detail
*@property {!number} total - Total for this purchase
*/

/**
*
*An object describing a Bill
*@typedef {Object} Bill
*@property {number} secuence - Secuential number from 1 to 999999999.
*@property {number} emisionPoint - Numeric code for the emision point. It can grow when the secuence number reaches it's limit to provide aditional unique bills
*@property {Object} billingInfo - Object containing the buyer's info.
*@property {string} billingInfo.name - Buyer's name
*@property {string} billingInfo.address - Buyer's address
*@property {string} billingInfo.identifier - Buyer's Id. Any identification number that buyer provides
*@property {string} billingInfo.idType - Buyer's Id type. Can be Passport (06) Ecuadorian CI (05) Ecuadorian RUC (04) or Consumidor Final (07), which is used when no idType was specified (identifier must equal 9999999999 in this case).
*@property {string} billingInfo.email - Buyer's email address
*@property {string} accessKey - A calculated String using bill's information. More info on http://www.sri.gob.ec/DocumentosAlfrescoPortlet/descargar/fbb05cf5-32f2-4cc3-bc8a-b539c9e0ed74/FICHA+TECNICA+COMPROBANTES+ELECTRO%B4NICOS+offline.pdf
*@property {string} numericCode - A randomly generated numeric code to confirm we are the one generating them
*@property {string} autNumber - Authorization number returned when the SRI soap service authorizes this bill
*@property {Detail} detail - Detail for the objects for the corresponding purchase
*@property {string} signedVersion - A string containing the corresponding signed version
*@property {array} payments - An array containing the corresponding payments
*@property {string} user - The owner's id
*/
module.exports={
  types:{
    billingInfo:function(info){
      return validate.billingInfo(info);
    }
  },
  attributes:{
    secuence:{type:'integer'},
		emisionPoint:{type:'integer'},
		billingInfo: {type:'object',billingInfo:true},
		numericCode:{type:'string'},
		accessKey:{type:'string'},
		autNumber:{type:'string',defaultsTo:null},
    sent:{type:'boolean',defaultsTo:false},
    detail:{type:'object',required:true},
    signedVersion: {type:'string'},
    payments: {collection:'payment',via:'bill'},
    user: {model:'user',required:true},
    //this function returns the bill on a JSON format compatible with the SRI's Factura standard and ready to be parsed for the xml2js module
    toSRIFormat: function(){
      var bill = this.toObject();
      var detalles=[],taxes={},subTotal=0,discSubTotal=0;
      bill.detail.items.forEach((item,index)=>{
        var det = {
									codigoPrincipal:item.code,
									descripcion:item.description,
									cantidad:item.qty,
									precioUnitario:(item.unitPrice).toFixed(2),
									descuento:item.discount,
									precioTotalSinImpuesto:item.total,
									impuestos:{
										impuesto:[]
									}
								};
        subTotal +=item.total;
        discSubTotal +=item.discount;
        item.taxes.forEach((tax)=>{
          var imp = {
            codigo:tax.code,
            codigoPorcentaje:tax.rateCode,
            tarifa:tax.rate,
            baseImponible:item.total,
            valor:(item.total*tax.rate).toFixed(2)
          };
          if(taxes[tax.code]){
            taxes[tax.code].baseImponible+=imp.baseImponible;
            taxes[tax.code].valor+=imp.valor;
          }else{
            taxes[tax.code]={
              codigo:imp.codigo,
              codigoPorcentaje:imp.codigoPorcentaje,
              baseImponible:imp.baseImponible,
              valor:imp.valor
            };
          }
          det.impuestos.impuesto.push(imp);
        });
        detalles.push(det);
      });
      var taxArr=[];
      Object.keys(taxes).forEach((key)=>{
        taxArr.push(taxes[key]);
      });
      var factura={
				'factura':{
					'$':{id:'comprobante',version:'1.0.0'},
					infoTributaria:{
						ambiente:billInfo.ambiente,
						tipoEmision:'1',
						razonSocial:billInfo.razonSocial,
						nombreComercial:billInfo.nombreComercial,
						ruc:billInfo.ruc,
						claveAcceso:bill.accessKey,
						codDoc:'01',
						estab:billInfo.establecimiento,
						ptoEmi:pad(bill.emisionPoint,3),
						secuencial:pad(bill.secuence,9),
						dirMatriz:billInfo.dirMatriz
					},
					infoFactura:{
						fechaEmision:(new Date(bill.createdAt)).toFormat('DD/MM/YYYY'),
						obligadoContabilidad:"SI",
						tipoIdentificacionComprador:bill.billingInfo.idType,
						razonSocialComprador:bill.billingInfo.name,
						identificacionComprador:bill.billingInfo.identifier,
						totalSinImpuestos:(subTotal).toFixed(2),
						totalDescuento:(discSubTotal).toFixed(2),
						totalConImpuestos:{
							totalImpuesto:taxArr
						},
						propina:0,
						importeTotal:(bill.detail.total).toFixed(2)
					},
					detalles:{
						detalle:detalles
					},
					infoAdicional:{
						campoAdicional:[
              {'$':{nombre:'email'},'_':bill.billingInfo.email},
              {'$':{nombre:'direccion'},'_':bill.billingInfo.address}
            ]
					}
				}
			};
      if(!bill.billingInfo.email||!bill.billingInfo.address){
        delete factura['factura'].infoAdicional;
      }
      return factura;
    }
  },
	beforeCreate:function(newRecord,next){
		Bill.find({sort:'createdAt DESC',limit:1}).exec(function(err,bills){
			if(err)return next(err);
			var last = bills[0];
			if(last){
				var created=new Date(last.createdAt);
				if(Date.today().getYear()>created.getYear()){
					newRecord.secuence=1;
					newRecord.emisionPoint=2;
				}else{
					if(last.secuence>=999999999){
						newRecord.secuence=1;
						newRecord.emisionPoint=last.emisionPoint+1;
					}else{
						newRecord.secuence=last.secuence+1;
						newRecord.emisionPoint=last.emisionPoint;
					}
				}
			}else{
				newRecord.emisionPoint=2;
				newRecord.secuence=1;
			}
			newRecord.numericCode=random.generate({length:8,charset:'numeric'});
			newRecord.accessKey= Date.today().toFormat('DDMMYYYY')+'01'+billInfo.ruc+billInfo.ambiente+billInfo.establecimiento+pad(newRecord.emisionPoint,3)+pad(newRecord.secuence,9)+newRecord.numericCode+'1';
			newRecord.accessKey= newRecord.accessKey + digit11(newRecord.accessKey);
			return next();
		});
	},
  /**
  *
  *Function executed afer the bill is created. It takes care of the bill sending process to the SRI.
  *
  *@param {Object} newRecord - New Bill passed by the sails logic
  *@param {function} next - Function called after the process is completed
  */
  afterCreate:function(newRecord,next){
    Bill.findOne(newRecord.id,(err,bill)=>{
      if(err) return next(err);
      xmlSig.sign(bill.toSRIFormat(),(err,signed)=>{
        if(err) return next(err);
        soapSRI.enviarComprobante(signed,function(err,received){
					if(err) return next(err);
          if(received){
            bill.sent=true;
            bill.signedVersion=signed;
            bill.save((err)=>{
              if(err)return next(err);
              next();
            });
          }else{
            next();
          }
				});
      });
    });
  },
  /**
  *
  *Send determined bill to authorize in the SRI server
  *
  *@param {string} id - The id of the bill to be authorized
  */
  authorizeBill:function(id,next){
    Bill.findOne(id,(err,found)=>{
      if(err) return next(err);
      soapSRI.autorizarComprobante(found.accessKey,(auterr,autNumber,raw)=>{
        if(auterr) return next(auterr);
        found.autNumber=autNumber;
        found.save((err)=>{
          if(err)return next(err);
          return next();
        });
      });
    });
  }

};
