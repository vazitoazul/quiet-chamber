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
  ]
};
