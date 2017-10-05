var pdfizer = require('html-pdf')
		path = require('path');
var config = {
  // Papersize Options: http://phantomjs.org/api/webpage/property/paper-size.html
  "height": "2339px",        // allowed units: mm, cm, in, px
  "width": "1654px",            // allowed units: mm, cm, in, px
  "format": "A4",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
  "orientation": "portrait", // portrait or landscape

  "border": {
    "top": "30px",            // default is 0, units: mm, cm, in, px
    "right": "10px",
    "bottom": "24px",
    "left": "29px"
  },

  "header": {
    "height": "45mm",
    "contents": '<div style="text-align: center;">Factura</div>'
  },
  "footer": {
    "height": "28mm",
    "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
  },


  // Rendering options
  "base": "file:///"+path.resolve(__dirname,'../../'), // Base path that's used to load files (images, css, js) when they aren't referenced using a host

  // File options
  "type": "pdf",             // allowed file types: png, jpeg, pdf


};

module.exports={
	generateFactura:function(data,next){
    var temp=path.resolve(__dirname,'../../.tmp/'+data.bill.accessKey+'.pdf');
		data.layout=false;
		sails.renderView('receipts/factura',data,(err,html)=>{
			if(err) return next(err);
			pdfizer.create(html,config).toFile(temp,function(err, file){
			  if(err)return next(err,null);
			  return next(null,file);
			});
		});


	}
}
