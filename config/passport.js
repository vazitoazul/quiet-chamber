/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and where you
 * define the authentication strategies you want your application to employ.
 *
 * I have tested the service with all of the providers listed below - if you
 * come across a provider that for some reason doesn't work, feel free to open
 * an issue on GitHub.
 *
 * Also, authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */
module.exports.passport = {
  local: {
    strategy: require('passport-local').Strategy
  },

  // bearer: {
  //   strategy: require('passport-http-bearer').Strategy
  // },

  // twitter: {
  //   name: 'Twitter',
  //   protocol: 'oauth',
  //   strategy: require('passport-twitter').Strategy,
  //   options: {
  //     consumerKey: 'your-consumer-key',
  //     consumerSecret: 'your-consumer-secret'
  //   }
  // },

  // github: {
  //   name: 'GitHub',
  //   protocol: 'oauth2',
  //   strategy: require('passport-github').Strategy,
  //   options: {
  //     clientID: 'your-client-id',
  //     clientSecret: 'your-client-secret'
  //   }
  // },

  facebook: {
    name: 'Facebook',
    protocol: 'facebook',
    strategy: require('passport-custom'),
    options: {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      scope: ['email'], /* email is necessary for login behavior */
      custom:true,
      profileFields: ['id', 'first_name','last_name','picture', 'email'],
      enableProof:true,
      appsecret_proof:process.env.FACEBOOK_APPSECRET
    }
  },
  google: {
    name: 'Google',
    protocol: 'google',
    strategy: require('passport-custom'),
    options: {
      clientID: process.env.GOOGLE_ID,
      custom:true,
      clientSecret: process.env.GOOGLE_SECRET,
      scope:['https://www.googleapis.com/auth/userinfo.email'],
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    }
  }

  // cas: {
  //   name: 'CAS',
  //   protocol: 'cas',
  //   strategy: require('passport-cas').Strategy,
  //   options: {
  //     ssoBaseURL: 'http://your-cas-url',
  //     serverBaseURL: 'http://localhost:1337',
  //     serviceURL: 'http://localhost:1337/auth/cas/callback'
  //   }
  // }
};
