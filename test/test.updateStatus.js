var request = require('request')
  , fs = require('fs')
  , t2w = require('../')
  , should = require('chai').should()
  
  , confPath = process.env.HOME + '/.tweirc'
  , config = new (require('../lib/config').Config)(confPath)
  ;
  
var accessToken = config.get('tsina.access_token');
  
  
describe('Update status', function(){

  afterEach(function(done){
    setTimeout(function wait(){
      //too fast?
      done();
    }, 4000);
  });
  describe('Update status', function(){
    it('simple text status', function(done){
      var text = '#test# test';
      t2w.updateWeibo({
          accessToken: accessToken
        , message: text
      }).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        reply.should.have.property('text');
        reply.text.should.eql(text);
        
        done();
        destroy(reply.id);
      }).on('error', function(err){
        should.not.exist(err);
        done();
      });
    });
    
    it('包含有特殊字符的微博', function(done){
      var text = '#test# ~!@#$%^&*()_+/{}|:"<>?\=\\';
      t2w.updateWeibo({
          accessToken: accessToken
        , message: text
      }).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        reply.should.have.property('text');
        reply.text.should.eql(text);
        
        done();
        destroy(reply.id);
      }).on('error', function(err){
        should.not.exist(err);
        done();
      });
    });
  });
  
  it('update a status with coordinates', function(done){
    var text = '#test# coordinates';
    t2w.updateWeibo({
        accessToken: accessToken
      , message: text
      , coordinates: [114.169938, 22.559385]
    }).on('success', function(reply){
      reply.should.be.a('object');
      reply.should.not.have.property('error');
      reply.should.have.property('text');
      reply.text.should.eql(text);
      
      should.exist(reply.geo);
      reply.geo.should.be.a('object');
      
      done();
      destroy(reply.id);
    }).on('error', function(err){
      should.not.exist(err);
      done();
    });
  });
  
  
  it('update a status with coordinates and an image', function(done){
    this.timeout(10000);
    
    var text = '#test# image';
    t2w.updateWeibo({
        accessToken: accessToken
      , message: text
      , coordinates: [114.169938, 22.559385]
      , image: 'http://nodejs.org/images/logo.png'
    }).on('success', function(reply){
      reply.should.be.a('object');
      reply.should.not.have.property('error');
      reply.should.have.property('text');
      reply.text.should.eql(text);
      
      should.exist(reply.geo);
      reply.geo.should.be.a('object');
      
      reply.should.have.property('original_pic');
      
      done();
      
      destroy(reply.id);
    }).on('error', function(err){
      should.not.exist(err);
      done();
    });
    
  });
  
  function destroy(id){
    t2w.executeApi('status.remove', {
        access_token: accessToken
      , id: id
    });
  
  }
});