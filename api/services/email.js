var api_key = sails.config.mailgun.api_key,
    domain = sails.config.mailgun.domain,
    Mailgun = require('mailgun-js'),
    mailgun = new Mailgun({apiKey: api_key, domain: domain});
module.exports={
    /**
    *Sends an email using mailgun. There must be a configured view inside views/email with the name of the view that is going to
    *be used to compose the email.
    *@param {string} view - The name of the view that is going to be used
    *@param {object} info - The info needed to compose some custom emails
    *@param {object} destination - Cointains the destination address and subject
    *@param {function} callback - The function executed at the end

    */
    email:function(view,info,destination,callback){
      info.layout=false;
      view='email/'+view;
      //render the view with the givven info
      sails.renderView(view,info,function(err,result){
        if(err)return callback(err);
        //construct the data object to be sent
        var data={
          from:'noreply@'+domain,
          to: destination.to,
          subject:destination.subject,
          html:result
        };
        mailgun.messages().send(data, function (err, body) {
          if(err)return callback(err);
          callback(null,body);
        });
      });
    }
};
