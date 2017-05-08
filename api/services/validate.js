function verificarCedula(cedula){
	if(cedula.length!=10){
		return false;
	}
	var sum= 0,coef=2;

	for (var i = 0; i < cedula.length-1; i++) {
		var res = cedula[i]*coef>=10 ? (cedula[i]*coef)-9 : (cedula[i]*coef);
		sum+=res;
		coef = coef===2 ? 1 : 2;
	};
	return (10-(sum%10))==cedula[9];
};
function verificarRuc(ruc){
	if(ruc.length!=13){
		return false;
	}
	if(ruc[2]==9){
		var sum= 0,coefs=[4,3,2,7,6,5,4,3,2];
		for (var i = 0; i < coefs.length; i++) {
			var res = coefs[i]*ruc[i];
			sum+=res;
		};
		return (11-(sum%11))==ruc[9];

	}else if(ruc[2]==6){
		var sum= 0,coefs=[3,2,7,6,5,4,3,2];
		for (var i = 0; i < coefs.length; i++) {
			var res = coefs[i]*ruc[i];
			sum+=res;
		};
		return (11-(sum%11))==ruc[8];

	}else if(ruc[2]<6){
		return verificarCedula(ruc.slice(0,-3)) &&(ruc[10]+ruc[11]+ruc[12])==1;
	}
};
/**
*
*This service contains validation functions for different types of objects
*
*/
module.exports={
  billingInfo:function(info){
    if(!info)return false;
    if(info.name&&info.identifier&&info.idType){
      if(info.idType==='04'||info.idType==='05'||info.idType==='06'||info.idType==='07'){
        if(info.idType==='07'&&info.identifier!=='9999999999999'){
          return false;
        }
        if(info.idType==='05'&&!verificarCedula(info.identifier)){
          return false;
        }
        if(info.idType==='04'&&!verificarRuc(info.identifier)){
          return false;
        }
        return true;
      }
    }
    return false;
  }
};
