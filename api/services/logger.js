var Logger = require('le_node');
var log = new Logger({ token: sails.config.logentries.token });
module.exports=log;