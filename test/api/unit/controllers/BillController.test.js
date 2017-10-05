var request = require('supertest');
var chai = require('chai')
  , should = chai.should();
var user = request.agent('http://localhost:9000');
var unauthenticated = request.agent('http://localhost:9000');

var authorizedBillInfo= {"autNumber" : "2504201701040137449100110010020000000024310444114",
"signedVersion" : "<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>"};
describe('BillController',function(){
  before(function(done) {
     user
       .post('/auth/local')
       .send({identifier : 'buyer@dinabun.com',password : 'testtest'})
       .end(done);
  });
  describe('Checking security on an unauthenticated user',function(){
    it('should return forbidden on /allBills',function(done){
      unauthenticated
        .get('/allBills')
        .expect(403)
        .end(done)
    });
    it('should return forbidden on /billpdf/somefalseid',function(done){
      unauthenticated
        .get('/billpdf/somefalseid')
        .expect(403)
        .end(done)
    });
    it('should return forbidden on /billxml/somefalseid',function(done){
      unauthenticated
        .get('/billxml/somefalseid')
        .expect(403)
        .end(done)
    });
    it('should return forbidden on /requestBill',function(done){
      unauthenticated
        .post('/requestBill')
        .expect(403)
        .end(done)
    });
  });

  describe('Creating bills for payments',function(){
    var paymentIds=[];
    before(function(done){
      var paymentsModel=sails.models.payment;
      //get the id for a created User who is going to be the recommender
      paymentsModel.find().exec((err,payments)=>{
        if(err)return done(err);
        payments.forEach(function(item){
          paymentIds.push(item.id);
        });
        done();
      });
    });

    it('should return a 409 when some of the payments doesn\'t exist',function(done){
      user
        .post('/requestBill')
        .send({payments:[paymentIds[0],'somerandomid123']})
        .expect(409)
        .expect((res)=>{
          res.body.error.should.equal('nonexisting_payments');
        })
        .end(done)
    });
    var firstBillSecuence;
    it('should generate a bill from some payments',function(done){
      this.timeout(10000);
      user
        .post('/requestBill')
        .send({payments:paymentIds.slice(0,2)})
        .expect(200)
        .expect((res)=>{
          res.body.should.have.property('bill');
          firstBillSecuence=res.body.bill.secuence;
        })
        .end(done);
    });
    it('should generate a bill with the next secuence number',function(done){
      this.timeout(10000);
      user
        .post('/requestBill')
        .send({payments:paymentIds.slice(2,4)})
        .expect(200)
        .expect((res)=>{
          res.body.should.have.property('bill');
          res.body.bill.secuence.should.equal(firstBillSecuence+1);
        })
        .end(done);
    });
  });

  describe('Getting bills',function(){
    var billId;
    before(function(done){
      var billModel=sails.models.bill;
      //Update the bills to appear as they have been authorized
      billModel.update({},authorizedBillInfo).exec((err,updated)=>{
        if(err)return done(err);
        billId = updated[0].id;
        done();
      });
    });
    it('should get all the user bills into an array',function(done){
      user
        .get('/allBills')
        .expect(200)
        .expect((res)=>{
          res.body.bills.length.should.equal(2);
        })
        .end(done)
    });
    it('should return a bad request (400) for a bill pdf that does not exists',function(done){
      user
        .get('/billpdf/a11231235gfh131hg')
        .expect(400)
        .end(done);
    });
    it('should get a specific bill in xml',function(done){
      user
        .get('/billxml/'+billId)
        .expect(200)
        .expect('Content-Type', 'text/xml; charset=utf-8')
        .end(done);
    });
    it('should return a bad request (400) for a bill xml that does not exists',function(done){
      user
        .get('/billxml/3123ghjgyug1231')
        .expect(400)
        .end(done);
    });
  });
});
