var soap=require('soap');
var bill = sails.config.bills;
module.exports={
	enviarComprobante:function(comprobante,next){
		var options = {
	       ignoredNamespaces: {
	          namespaces: ['targetNamespace', 'typedNamespace'],
	          override: true
	        }
	    };
		soap.createClient(bill.recepUrl,options,function(err,client){
			if(err){
				logger.err({message:'Servidor SRI down',error:err});
				return next({error:'SRI_server_down'});
			}
			var comp=comprobante.replace('\"','"');
			comp = (new Buffer(comp)).toString('base64');
			client.validarComprobante({xml:{'$value':comp}},function(err,result){
				if(err){
					logger.err({message:'Servidor de SRI en mantenimiento',error:err});
					return next({error:'SRI_maitainance'});
				}
				if(result.RespuestaRecepcionComprobante.estado=="RECIBIDA"){
						return next(null,true);
					}else{
						logger.err({message:'Factura Rechazada',result:result});
						return next({error:'rejected_bill'});
					}
			});

		});
	},
	autorizarComprobante:function(claveAcceso,next){
		var options = {
	       ignoredNamespaces: {
	          namespaces: ['targetNamespace', 'typedNamespace'],
	          override: true
	        }
	    };
		soap.createClient(bill.autorUrl,options,function(err,client){
			if(err){
				logger.err({message:'Servidor SRI down',error:err});
				return next({error:'SRI_server_down'});
			}
			client.autorizacionComprobante({claveAccesoComprobante:claveAcceso},function(err,result,raw){
				if(err){
					logger.err({message:'Servidor SRI en mantenimiento',error:err});
					return next({error:'SRI_maitainance'});
				}
				console.log(JSON.stringify(result,null,4));
				if(result.RespuestaAutorizacionComprobante.numeroComprobantes=='0'){
					logger.err({message:'No se autorizó ningún comprobante',result:result});
					return next({error:'no_receipt_authorized'});
				}
				var aut=result.RespuestaAutorizacionComprobante.autorizaciones.autorizacion;
				if(aut.estado=="AUTORIZADO"){

	       	return next(null,aut.numeroAutorizacion)
	      }else{
	        logger.err({message:'El comprobante numero:'+claveAcceso+' tuvo problemas de autorización'});
	        logger.err({message:'Respuesta:',response:aut.mensajes});
	        return next({error:'receipt_not_authorized'});
	      }
			});

		});
	}
};
