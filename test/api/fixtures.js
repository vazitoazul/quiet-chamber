require('date-utils');
module.exports ={
  order: [ 'User', 'Passport','Payment'],
  empty:['Passport'],
  User:[
      {
      	"email" : "buyer@dinabun.com",
      	"mailVerified" : true,
        "intlCredential":"EC040101010101"
      },
      {
      	"email" : "currentUser@dinabun.com",

      },
      {
      	"email" : "extraUser@dinabun.com",

      },
      {
      	"email" : "newRecommender@dinabun.com",

      },
      {
      	"email" : "mailNotVerifiedUser@dinabun.com",
      }
  ],
  Passport:[
  		{
  			"protocol" : "local",
  			"password" : "testtest",
  			models :{
  					"user" : {email:"buyer@dinabun.com"}
  			}
  		},
  		{
  			"protocol" : "local",
  			"password" : "testtest",
  			models :{
  					"user" : {email:"currentUser@dinabun.com"}
  			}
  		},
  		{
  			"protocol" : "local",
  			"password" : "testtest",
  			models :{
  					"user" : {email:"extraUser@dinabun.com"}
  			}
  		},
  		{
  			"protocol" : "local",
  			"password" : "testtest",
  			models :{
  					"user" : {email:"newRecommender@dinabun.com"}
  			}
  		},
  		{
  			"protocol" : "local",
  			"password" : "testtest",
  			models :{
  					"user" : {email:"mailNotVerifiedUser@dinabun.com"}
  			}
  		}
  ],
  Payment:[
    {
      confirmed:false,
      amount:17.20,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    },
    {
      confirmed:false,
      amount:17.20,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    },
    {
      confirmed:false,
      amount:17.20,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    },
    {
      confirmed:false,
      amount:17.20,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    }
  ],
  Post:[
    {
      type: 'j',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eget egestas mi, sed sagittis velit. Vivamus arcu risus, laoreet ut nisl non, pellentesque sagittis leo. In pulvinar quam eu ultrices facilisis. Aliquam erat volutpat. ',
      amount : 345,
      name : 'trabajo 1',
      labels : [ "automovile", "propaganda", "plumber" ],
      placesIds : [ "ChIJ1UuaqN2HI5ARAjecEQSvdp0", "ChIJn3xCAkCa1ZERclXvWOGRuUQ" ],
      models : {
        business : { name : 'chachito'}
      }
    },
    {
      type: 'd',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eget egestas mi, sed sagittis velit. Vivamus arcu risus, laoreet ut nisl non, pellentesque sagittis leo. In pulvinar quam eu ultrices facilisis. Aliquam erat volutpat. ',
      amount : 345,
      name : 'trabajo 2',
      labels : [ "accesories"],
      placesIds : [ "ChIJN-TvJYNw1ZERnqEqXhutzpQ" ],
      models : {
        business : { name : 'chachito'}
      }
    },
    {
      type: 'j',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eget egestas mi, sed sagittis velit. Vivamus arcu risus, laoreet ut nisl non, pellentesque sagittis leo. In pulvinar quam eu ultrices facilisis. Aliquam erat volutpat. ',
      amount : 345,
      name : 'trabajo 3',
      labels : [ "accesories","art"],
      placesIds : [ "asdf","asdf" ],
      models : {
        business : { name : 'panchito'}
      }
    },
    {
      type: 'd',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eget egestas mi, sed sagittis velit. Vivamus arcu risus, laoreet ut nisl non, pellentesque sagittis leo. In pulvinar quam eu ultrices facilisis. Aliquam erat volutpat. ',
      amount : 345,
      name : 'trabajo 4',
      labels : ["art"],
      placesIds : [ "ChIJN-TvJYNw1ZERnqEqXhutzpQ", "ChIJn3xCAkCa1ZERclXvWOGRuUQ", "ChIJ1UuaqN2HI5ARAjecEQSvdp0", "ChIJn3xCAkCa1ZERclXvWOGRuUQ" ],
      models : {
        business : { name : 'panchito'}
      }
    }
  ]
};
