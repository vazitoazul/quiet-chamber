/**
* Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

	models:{
		connection:'testMongo',
		migrate: 'drop'
	},
	mailgun:{
	  api_key:process.env.MAILGUN_APIKEY,
	  domain:process.env.MAILGUN_DOMAIN,
	  test:true
	},
	session:{
		secret:'f99fc5594661102ab5055dc74a2f2ebd',
		adapter:'connect-redis',
		url:'redis://127.0.0.1:6379/0'
	},
	connections:{
		testMongo:{
			adapter:'sails-mongo',
			url:'mongodb://localhost:27017/quiet'
		}
	},
	port:9000,

	// log:{
	// 	level:"silly"
	// },
	paths:{
		'public':'.'
	}


};
