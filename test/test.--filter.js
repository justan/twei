var cli = require('../lib/cli_core')
  , should = require('chai').should()
  , exec = require('child_process').exec;
  ;

describe("--filter 选项", function(){
  var cliStr = "twei remind --filter status"
    ;
  
  afterEach(function(done){
    setTimeout(function wait(){
      //too fast?
      done();
    }, 1000);
  });
  
 it(cliStr, function(done){
    var child_process = exec(cliStr);
    child_process.stdout.on('data', function(out){
      (out.trim() * 1).should.be.a('number');
      done();
    })
  });
  
  cliStr = "twei timeline count=1 --filter statuses.id statuses.text"
  
  it(cliStr, function(done){
    var child_process = exec(cliStr);
    child_process.stdout.on('data', function(out){
      var res = out.split(/\t+/);
      (res[0] * 1).should.be.a('number')
      res[1].should.be.a('string')
      done();
    })
  });
});