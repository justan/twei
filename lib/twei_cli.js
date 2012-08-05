#!/usr/bin/env node

var fs = require('fs')
  , path = require('path')
  , core = require('./cli_core')
  ;

var args = (function (argvs){
  var args = argvs.slice()
    , startIndex = 1
    ;
    
  for(var i = 0, l = args.length; i < l; i++){
    if(path.basename(args[i]) === 'twei_cli.js'){
      startIndex = i;
      break
    }
  }
  
  return args.slice(startIndex + 1);
})(process.argv);

core.init(args);
