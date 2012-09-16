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

});