require('date-utils');
module.exports ={
  order: [ 'User', 'Passport','Payment','Business','Post'],
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
      },
      {
      	"email" : "businessowner@dinabun.com",
        "mailVerified":true,
        "intlCredential":"EC040102030104"
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
  		},
  		{
  			"protocol" : "local",
  			"password" : "testtest",
  			models :{
  					"user" : {email:"businessowner@dinabun.com"}
  			}
  		}
  ],
  Payment:[
    {
      confirmed:false,
      amount:17.20,
      tax:2.2,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    },
    {
      confirmed:false,
      amount:17.20,
      tax:2.2,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    },
    {
      confirmed:false,
      amount:17.20,
      tax:2.2,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    },
    {
      confirmed:false,
      amount:17.20,
      tax:2.2,
      models:{
        user: {email:'buyer@dinabun.com'}
      }
    }
  ],
  Business:[
    {
      name: 'Test Business 1',
      description: 'This is the first business',
      placesIds:[
        'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
        'ChIJ1UuaqN2HI5ARAjecEQSvdp0',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ'
      ],
      cityLabel: 'Quito, Ecuador',
      email: 'asdf@asdf.com',
      telephones: ['12341234','123423'],
      labels: [ 'automovile'],
      models :{
          "user" : {email:"businessowner@dinabun.com"}
      }
    },
    {
      name: 'Test Business 2',
      description: 'This is the second business',
      placesIds:[
        'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
        'ChIJ1UuaqN2HI5ARAjecEQSvdp0',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ'
      ],
      cityLabel: 'Quito, Ecuador',
      email: 'asdf@asdf.com',
      telephones: ['12341234','123423'],
      labels: [ 'accesories'],
      models :{
          "user" : {email:"businessowner@dinabun.com"}
      }
    }
  ],
  Post:[
    {
      type: 'd' ,
      labels : ['automovile'],
      placesIds: [
        'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
        'ChIJ1UuaqN2HI5ARAjecEQSvdp0',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ'
      ],
      cityLabel: 'Quito, Ecuador',
      details:{
        description:'Queremos salvar perritos en quito',
        reason:'El dinero se va a utilizar para recoger los perros',
        minDonation: 100
      },
      name : 'Salva perros en quito',
      models : {
        business : { name : 'Test Business 1'}
      }
    },
    {
      type: 'j' ,
      labels : ['automovile'],
      placesIds: [
        'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
        'ChIJ1UuaqN2HI5ARAjecEQSvdp0',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ'
      ],
      cityLabel: 'Quito, Ecuador',
      details:{
        description:'Se necesita un repartidor en quito',
        requirements:'Se debe tener licencia tipo B',
        salary: 300,
        time: 'm'
      },
      name : 'Se busca un repartidor en Quito',
      models : {
        business : { name : 'Test Business 1'}
      }
    },
    {
      type: 'i' ,
      labels : ['accesories'],
      placesIds: [
        'ChIJN-TvJYNw1ZERnqEqXhutzpQ',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ',
        'ChIJ1UuaqN2HI5ARAjecEQSvdp0',
        'ChIJn3xCAkCa1ZERclXvWOGRuUQ'
      ],
      cityLabel: 'Quito, Ecuador',
      details:{
        description:'Necesitamos dinero para nuestro nuevo almacén de calcetines',
        reason:'El dinero se va a utilizar para alquilar el almacén',
        minInvestment: 100,
        returnPercentage: 12,
        returnTime:1
      },
      name : 'Invierte en calcentines',
      models : {
        business : { name : 'Test Business 2'}
      }
    }

  ]
};
