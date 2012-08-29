var cli = require('../lib/cli_core')
  , alias = require('../lib/alias')
  , should = require('chai').should()
  ;

describe("test twei's cli interface", function(){
  var cliStr = "timeline count=4 page=2 -d"
    , args = cliStr.split(' ')
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
      argMap.cmd.param[2].should.equal(args[1]);//timeline alias 中自带了一个 count=5
      argMap.opts.should.have.property('-d');
    });
    
    it('格式: `twei timeline --count 6 page=2`', function(){
      var cliStr = "timeline --count 6 page=2"
        , args = cliStr.split(' ')
        , argsCopy = args.slice()
        , lastArgs = cli.restoreAlias(argsCopy.shift()).concat(argsCopy)
        , argMap = cli.argParser(lastArgs);
        
      argMap.cmd.name.should.equal(lastArgs[0]);
      argMap.cmd.param[2].should.equal('count=6');
      argMap.cmd.param[3].should.equal(args[3]);//page=2
    });
  });
  
  describe("argParser.getOptFn", function(){
    it('get `--version` handler', function(){
      cli.argParser.getOptFn('--version').should.be.a('function');
    });
  });
});