var cli = require('../lib/cli_core')
  , should = require('chai').should()
  , httpProxy = require('http-proxy')
  , twei = require('../')
  
  , confPath = process.env.HOME + '/.tweirc'
  , config = new (require('../lib/config').Config)(confPath)
  , accessToken = config.get('tsina.access_token')
  
  , proxyServer = require('./proxy/proxy.js')
  , port = 2013
  ;
  

  describe("--proxy ≤‚ ‘", function() {
    before(function(done) {
      console.log(port);
      proxyServer.listen(port, function() {
        console.log('done')
        done()
      });
    })
  
    it('http proxy', function(done){
      twei.setProxy('http://localhost:' + port);
      
      twei.executeApi('statuses.home', {
          access_token: accessToken
        , count: 5
      }).on('success', function(reply){
        reply.should.be.a('object');
        reply.should.not.have.property('error');
        
        reply.should.have.property('statuses');
        reply.statuses.should.be.a('array');
        
        done();
      }).on('error', function(err){
        done(err);
      });
    });
  });

