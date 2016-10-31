var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    email     : { type: 'email',  unique: true },
    passports : { collection: 'Passport', via: 'user' },
    mailVerified : { type: 'boolean', defaultsTo : false},
    intlCredential : { type: 'string', unique : true}
  }
};

module.exports = User;
