var api_key = sails.config.mailgun.api_key,
    domain = sails.config.mailgun.domain,
    testMode= sails.config.mailgun.test,
    Mailgun = require('mailgun-js'),
    mailgun = new Mailgun({apiKey: api_key, domain: domain});
module.exports={
    /**
    *Sends an email using mailgun. There must be a configured view inside views/email with the name of the view that is going to
    *be used to compose the email.
    *@param {string} view - The name of the view that is going to be used
    *@param {Object} info - The info needed to compose some custom emails. See each view to find the exact parameters nedded.
    *@param {Object} destination - Cointains the destination address and subject
    *@param {string} destination.to - Address at which the email will be sent
    *@param {string} destination.subject - Subject of the email
    *@param {emailCallback} callback - The callback that handles the response
    */
    /**
    *
    *This callback function handles email sending response
    *
    *@callback emailCallback
    *@param {Object} error - Contains an error if something went wrong when sending the email. null when succeded
    *@param {Object} body - Contains the email body if everything went fine.
    */
    send:function(view,info,destination,callback){
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
          html:result,
          'o:testmode':testMode
        };
        mailgun.messages().send(data, function (err, body) {
          if(err){
            logger.warn('Error sending email',err);
            return callback(null);
          }
          callback(null,body);
        });
      });
    }
};
