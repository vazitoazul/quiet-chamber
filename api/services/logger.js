var Logger = require('le_node');
var log = new Logger({ token: sails.config.keys.logentries });
module.exports=log;