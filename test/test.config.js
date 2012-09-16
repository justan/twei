var should = require('chai').should()
  , exec = require('child_process').exec
  , ini = require('ini')
  , fs = require('fs')
  
  , Config = require('../lib/config').Config
  , CONFIGPATH = __dirname + '/.test.config.js.tmp'
  ;

describe("Config 构造函数", function(){

  var config
    , key = 'foo'
    , val = 'bar'
    , skey = 'foo1.bar'
    , keys = skey.split('.')
    ;
  
  it('new Config(CONFIGPATH)', function(){
    config = new Config(CONFIGPATH)
    config.confPath.should.equal(CONFIGPATH)
    config.conf.should.be.a('object');
  });
  
  it('config.set(' + key + ', ' + val + ')',  function(){
    config.set(key, val);
    config.conf[key].should.equal(val)
  });
  
  it('config.set(' + skey + ', ' + val + ')', function(){
    config.set(skey, val);
    config.conf[keys[0]][keys[1]].should.equal(val)
  });
  
  it('config.get(' + key + ')', function(){
    config.get(key).should.equal(val)
  });
  
  it('config.get(' + skey + ')', function(){
    config.get(skey).should.equal(val)
  });
  
  it('config.del(' + key + ')', function(){
    config.del(key)
    config.conf.should.not.have.property(key)
  });
  
  it('config.save()', function(){
    config.save();
    var fconf = ini.parse(fs.readFileSync(CONFIGPATH, 'utf8'))
    
    fconf.should.not.have.property(key);
    fconf[keys[0]][keys[1]].should.equal(val);
    fs.unlinkSync(CONFIGPATH)
  });
  
});
