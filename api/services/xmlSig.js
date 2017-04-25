var xml2js = require('xml2js'),
    builder= new xml2js.Builder({cdata:true,xmldec:{ 'version': '1.0', 'encoding': 'UTF-8' },renderOpts:{pretty:true}}),
    partBuilder = new xml2js.Builder({headless:true,renderOpts:{pretty:true}});
var fs = require('fs')
  , path=require('path')
  , ursa = require('ursa')
  , crypto=require('crypto')
  , pem=require('pem');
require('date-utils');
var password = sails.config.keys.sriPassword;
var signingKey;
var key,certificate,modulus,issuer,serial;

var getHash= function(base,inputEncoding){
	var hash=crypto.createHash('sha1');
	hash.update(base,inputEncoding||'utf8');
	return hash.digest('base64');
};
var sign= function(data){
  if(!key) return;
  var signer = ursa.createSigner('sha1');
	signer.update(data,'utf8');
	return signer.sign(signingKey,'base64');
};
var getBase64 = function(string){
	return (new Buffer(string).toString('base64'));
};

module.exports={
  /**
  *
  *Takes care of all the tasks regarding reading the certificate and generating
  *Signing objects/methods
  *
  *@param {string} certName - .p12 signed certificate's name. It must be inside certificated folder
  *
  */
  setUp:function(certName,next){
    var p = path.resolve(__dirname, '../../certificates/'+certName)
    pem.readPkcs12(p,{p12Password:password} ,(err,cert)=>{
      if(err)return next(err);
      //we have to get the base64 version of certificate,key and modulus to fit the standard
      key=getBase64(cert.key);
      certificate=getBase64(cert.cert);
      signingKey=ursa.createPrivateKey(cert.key);
      pem.getModulus(cert.cert,{},(err,mod)=>{
        if(err)return next(err);
        modulus=getBase64(mod.modulus);
        pem.readCertificateInfo(cert.cert,(err,info)=>{
          if(err) return next(err);
          var i = info.issuer;
          issuer = `C=${i.country},O=${i.organization},OU=${i.organizationUnit},L=${i.locality},CN=${i.commonName}`;
          serial = info.serial.split(' ')[0];
          next();
        });
      });

    });
  },
  /**
  *
  *Gets any kind of SRI receipt in JSON format (like the one that a bill produces) and parses to XML format.
  *Later it uses the certificate info collected on the setUp function to sign the XML.
  *
  *@param {Object} comprobante - The receipt to be signed
  *@param {Function} next - The function to be executed after signing is complete
  *
  *
  */
	sign:function(comprobante,next){
    try{
      var tipo=Object.keys(comprobante)[0];
  		var xmlComprobante= partBuilder.buildObject(comprobante);
  		var xmlSignedProperties='<etsi:SignedProperties Id="Signature620397-SignedProperties24123">';
  		xmlSignedProperties+='<etsi:SignedSignatureProperties>';
  		xmlSignedProperties+='<etsi:SigningTime>';
  		xmlSignedProperties+=Date.today().toFormat('YYYY-MM-DDTHH24:MM:SS')+'-05:00';
  		xmlSignedProperties+='</etsi:SigningTime>';
  		xmlSignedProperties+='<etsi:SigningCertificate>';
  		xmlSignedProperties+='<etsi:Cert>';
  		xmlSignedProperties+='<etsi:CertDigest>';
  		xmlSignedProperties+='<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>';
  		xmlSignedProperties+='<ds:DigestValue>'+getHash(certificate,'base64')+'</ds:DigestValue>';
  		xmlSignedProperties+='</etsi:CertDigest>';
  		xmlSignedProperties+='<etsi:IssuerSerial>';
  		xmlSignedProperties+='<ds:X509IssuerName>'+issuer+'</ds:X509IssuerName>';
  		xmlSignedProperties+='<ds:X509SerialNumber>'+serial+'</ds:X509SerialNumber>';
  		xmlSignedProperties+='</etsi:IssuerSerial>';
  		xmlSignedProperties+='</etsi:Cert>';
  		xmlSignedProperties+='</etsi:SigningCertificate>';
  		xmlSignedProperties+='</etsi:SignedSignatureProperties>';
  		xmlSignedProperties+='<etsi:SignedDataObjectProperties>';
  		xmlSignedProperties+='<etsi:DataObjectFormat ObjectReference="#Reference-ID-363558">';
  		xmlSignedProperties+='<etsi:Description>Comprobante electronico</etsi:Description>';
  		xmlSignedProperties+='<etsi:MimeType>text/xml</etsi:MimeType>';
  		xmlSignedProperties+='</etsi:DataObjectFormat>';
  		xmlSignedProperties+='</etsi:SignedDataObjectProperties>';
  		xmlSignedProperties+='</etsi:SignedProperties>';

  		var canSignedProperties=xmlSignedProperties.replace('Id="Signature620397-SignedProperties24123"','xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Signature620397-SignedProperties24123"');

  		var keyInfo='<ds:KeyInfo Id="Certificate1562780">\n';
  		keyInfo+='<ds:X509Data>\n';
  		keyInfo+='<ds:X509Certificate>\n';
  		keyInfo+=certificate+'\n';
  		keyInfo+='</ds:X509Certificate>\n';
  		keyInfo+='</ds:X509Data>\n';
  		keyInfo+='<ds:KeyValue>\n';
  		keyInfo+='<ds:RSAKeyValue>\n';
  		keyInfo+='<ds:Modulus>\n';
  		keyInfo+=modulus;
  		keyInfo+='</ds:Modulus>\n';
  		keyInfo+='<ds:Exponent>AQAB</ds:Exponent>\n';
  		keyInfo+='</ds:RSAKeyValue>\n';
  		keyInfo+='</ds:KeyValue>\n';
  		keyInfo+='</ds:KeyInfo>';

  		var canKeyInfo=keyInfo.replace('Id="Certificate1562780"','xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Certificate1562780"');

  		var xmlSignedInfo='<ds:SignedInfo Id="Signature-SignedInfo814463">\n';
  		xmlSignedInfo+='<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:CanonicalizationMethod>\n';
  		xmlSignedInfo+='<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></ds:SignatureMethod>\n';
  		xmlSignedInfo+='<ds:Reference Id="SignedPropertiesID157683" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature620397-SignedProperties24123">\n';
  		xmlSignedInfo+='<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>\n';
  		xmlSignedInfo+='<ds:DigestValue>'+getHash(canSignedProperties)+'</ds:DigestValue>\n';
  		xmlSignedInfo+='</ds:Reference>\n';
  		xmlSignedInfo+='<ds:Reference URI="#Certificate1562780">\n';
  		xmlSignedInfo+='<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>\n';
  		xmlSignedInfo+='<ds:DigestValue>'+getHash(canKeyInfo)+'</ds:DigestValue>\n';
  		xmlSignedInfo+='</ds:Reference>\n';
  		xmlSignedInfo+='<ds:Reference Id="Reference-ID-363558" URI="#comprobante">\n';
  		xmlSignedInfo+='<ds:Transforms>\n';
  		xmlSignedInfo+='<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"></ds:Transform>\n';
  		xmlSignedInfo+='</ds:Transforms>\n';
  		xmlSignedInfo+='<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>\n';
  		xmlSignedInfo+='<ds:DigestValue>'+getHash(xmlComprobante)+'</ds:DigestValue>\n';
  		xmlSignedInfo+='</ds:Reference>\n';
  		xmlSignedInfo+='</ds:SignedInfo>';

  		var canSignedInfo= xmlSignedInfo.replace('Id="Signature-SignedInfo814463"','xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Signature-SignedInfo814463"');

  		var xmlObject = '<ds:Object Id="Signature620397-Object231987">';
  		xmlObject+='<etsi:QualifyingProperties Target="#Signature620397">';
  		xmlObject+=xmlSignedProperties;
  		xmlObject+='</etsi:QualifyingProperties>';
  		xmlObject+='</ds:Object>';


  		var signature = '<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#" Id="Signature620397">\n';
  		signature+=xmlSignedInfo+'\n';
  		signature+='<ds:SignatureValue Id="SignatureValue398963">\n';
  		signature+=sign(canSignedInfo)+'\n';
  		signature+='</ds:SignatureValue>\n';
  		signature+=keyInfo+'\n';
  		signature+=xmlObject;
  		signature+='</ds:Signature>';
  		xmlComprobante = builder.buildObject(comprobante);
  		xmlComprobante=xmlComprobante.replace('</'+tipo+'>',signature+'</'+tipo+'>');
  		return next(null,xmlComprobante);
    }catch(e){

      console.log('este error',e);
      return next(e,null)
    }

	}
};
