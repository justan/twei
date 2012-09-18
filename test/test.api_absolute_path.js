var request = require('request')
  , fs = require('fs')
  , t2w = require('../')
  , should = require('chai').should()
  
  , confPath = process.env.HOME + '/.tweirc'
  , config = new (require('../lib/config').Config)(confPath)
  ;
  
var accessToken = config.get('tsina.access_token');
  
  
describe('通过 twei 直接同微博 api 交互', function(){
  
  afterEach(function(done){
    setTimeout(function wait(){
      //too fast?
      done();
    }, 2000);
  });
  
  describe('get', function(){
    var apiPath1 = '/2/statuses/public_timeline.json'
      , apiPath2 = 'https://api.weibo.com/2/statuses/public_timeline.json'
      ;
  
    it(apiPath1, function(done){
      
      t2w.executeApi(apiPath1, {
          access_token: accessToken
        , count: 5
      }).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        
        reply.should.have.property('statuses');
        reply.statuses.should.be.a('array');
        
        done();
      }).on('error', function(err){
        should.not.exist(err);
        done();
      });
      
    });
  
    it(apiPath2, function(done){
      
      t2w.executeApi(apiPath2, {
          access_token: accessToken
        , count: 5
      }).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        
        reply.should.have.property('statuses');
        reply.statuses.should.be.a('array');
        
        done();
      }).on('error', function(err){
        should.not.exist(err);
        done();
      });
    });
  });
  
  describe('post', function(){
    var text = '#twei#  #test#';
    var apiPath1 = '/2/statuses/update.json'
      , apiPath2 = 'https://api.weibo.com/2/statuses/destroy.json'
      , id
      ;
    
    it(apiPath1, function(done){
      
      t2w.executeApi(apiPath1, {
          access_token: accessToken
        , status: text
      }, {method: 'post'}).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        reply.should.have.property('text');
        reply.text.should.eql(text);
        
        id = reply.id;
        done();
        
      }).on('error', function(err){
        should.not.exist(err);
        done();
      });
    });
    
    
    it(apiPath2, function(done){
    
      t2w.executeApi(apiPath2, {
          access_token: accessToken
        , id: id
      }, {method: 'post'}).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        reply.should.have.property('text');
        reply.text.should.eql(text);
        
        done();
      }).on('error', function(err){
        should.not.exist(err);
        done();
      });
    });
    
  });
  
});