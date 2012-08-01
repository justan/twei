#!/usr/bin/env node

var util = require('util')
  , fs = require('fs')
  , path = require('path')
  , core = require('./cli_core')
  , shower = new (require('../lib/shower').use())
  ;
var TOKENPATH = __dirname + '/../access_token'
  , ACCESS_TOKEN_URL = fs.readFileSync(__dirname + '/../access_token_url', 'utf8')
  , tips = require('../txt/tips')
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

var msg // 微博内容
  , img
  , coordinates
  , apiName, apiExtra
  , nomsg //该命令不是发微博
  ;  
  
0 && (function (){
  var arg;
  var place, accesstoken;
  while (arg = args.shift()){
    if(arg === '--help' || arg === '-h' || arg === '-?'){
    
    }else if(arg === '--version' || arg === '-v'){
    
    }else if(arg === '--debug' || arg === '-d'){
    
    }else if(arg === '--image' || arg === '-i'){
    
    }else if(arg === '--place' || arg === '-p'){
    
    }else if(arg === '--coordinates' || arg === '-c'){
    
      coordinates = args.shift();
      place = false;
      
    }else if(arg === '--accesstoken' || arg === '-a'){
    
      if(!args[0] || !args[0].indexOf('-')){
        console.log(tips.arg_need_sth, shower.color(arg).info, shower.color('access_token').info);
        exit();
      }
      accesstoken = args.shift();
      nomsg = true;
      
    }else if(arg === '--execute' || arg === '-e'){//显示微博列表
    
      if(!args[0]){
        console.log(tips.arg_need_sth, shower.color(arg).info, shower.color(tips.status_type).info);
        help('status');
      }else if(args[0].indexOf('-')){
        apiName = args.shift();
        if(args[0] && args[0].indexOf('-')){
          apiExtra = args.shift();
        }
      }else{
        help('status');
      }
      nomsg = true;
      
    }else if(arg.indexOf("-") && !args.length){
      //最后一个
      msg = arg
    }
  }
  log('message: ' + msg);
  log('nomsg: ' + nomsg);
  if(!msg && !nomsg){
    help();
  }
  
  checkAccessToken(accesstoken, function(token){
    nomsg ? apiExc(token, apiName, apiExtra) : updateStatus(token);
  });
  
})();


