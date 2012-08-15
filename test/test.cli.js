var cli = require('../lib/cli_core')
  , alias = require('../lib/alias')
  , should = require('chai').should()
  ;

describe("test twei's cli interface", function(){
  var args = ["timeline", "count=5", "page=2", "-d"]
    , argsCopy = args.slice()
    , lastArgs = cli.restoreAlias(argsCopy.shift()).concat(argsCopy)
    ;
  
  describe("restoreAlias", function(){
    it('restore timeline', function(){
      cli.restoreAlias(args[0]).join(' ').should.equal(alias[args[0]]);
    });
  });
  
  describe("argParser", function(){
    it('check arguments parser of timeline', function(){
      var argMap = cli.argParser(lastArgs);
      argMap.cmd.name.should.equal(lastArgs[0]);
      argMap.cmd.param[1].should.equal(args[1]);
      argMap.opts.should.have.property('-d');
    });
  });
  
  describe("argParser.getOptFn", function(){
    it('get `--version` handler', function(){
      cli.argParser.getOptFn('--version').should.be.a('function');
    });
  });
});