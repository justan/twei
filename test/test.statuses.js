var request = require('request')
  , fs = require('fs')
  , t2w = require('../')
  , should = require('chai').should()
  ;
  
var accessToken = fs.readFileSync(__dirname + '/../access_token', 'utf8').trim();
  
  
describe('fetch statuses', function(){
  var g = 'status';
  var statuses = Object.keys(require('../lib/api/tsina').status);
  
  afterEach(function(done){
    setTimeout(function wait(){
      //too fast?
      done();
    }, 3000);
  });
  
  statuses.forEach(function(name){
  
    it(name, function(done){
      
      t2w.executeApi({
          group: g
        , name: name
      }, {
          access_token: accessToken
        , count: 5
      }).then(function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        reply.should.have.property('statuses');
        reply.statuses.should.be.a('array');
        
        done();
      }, function(err){
        should.not.exist(err);
        done();
      });
    });
    
  });

});