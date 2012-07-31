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


function checkAccessToken(token, success){
  if(!token){
    try{
      token = getLoalAccessToken();
    }catch(e){
      token = saveAccessToken('');
    }
    if(!token){
    
      takeAccessToken(function(t){
        token = t;
        success(token);
      });
      
    }else{
      success(token);
    }
  }else if(token === 'clear'){
    token = saveAccessToken('');
    exit();
  }else if(token === 'show'){
    console.log(shower.color(getLoalAccessToken(), 'info'));
    exit();
  }else{
    saveAccessToken(token);
    if(msg){
      success(token);
    }else{
      exit();
    }
  }
}

//从控制台获取 access_token, 直至有内容输入
function takeAccessToken(callback){
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdout.write(tips.input_access_token)
  process.stdin.on('data', function (text) {
    text = text.trim();
    process.stdin.removeListener('data', arguments.callee);
    process.stdin.pause();
    
    if(text){
      log('a new access token: ' + text);
      saveAccessToken(text);
      callback(text);
    }else{
      open(ACCESS_TOKEN_URL);
      takeAccessToken(callback);
    }
  });
}

function saveAccessToken(token){
   fs.writeFileSync(TOKENPATH, token, 'utf8');
   return token;
}

function getLoalAccessToken(){
  return fs.readFileSync(TOKENPATH, 'utf8');
}

function updateStatus(token){
  if(!msg){
    util.puts(tips.need_message);
    help();
  }

  var opts = {
      message: msg
    , accessToken: token
    , image: img
    , coordinates: coordinates && coordinates.split(',')
  };
  log('info: ' + util.inspect(opts));
  shower.emit('pendStart');
  require('../').updateWeibo(opts).then(function(reply){
    shower.emit('pendDone');
    checkreply(reply) && shower.emit('data', 'one', reply);
  }, function(err){
    shower.emit('pendFail');
    throw err;
  });
}

/**
 * 通用 api 执行程序
 * @param {String} token access_token
 * @param {String} apiName 格式为: group.name
 * @param {String} apiExtra 该请求的 querystring
 */
function apiExc(token, apiName, apiExtra){
  try{
    var query = require('querystring').decode(apiExtra)
      , group = apiName.split('.')
      , name = group[1];
      
    group = group[0];
    query.access_token = token;
    log('apiExtra: ' + apiExtra);
    log('query: ' + util.inspect(query));
    
    shower.emit('pendStart');
    require('../').executeApi({
        group: group
      , name: name
    }, query).then(function(reply){
      shower.emit('pendDone');
      if(checkreply(reply)){
        shower.emit('data', apiName, reply);
      };
    }, function(err){
      shower.emit('pendFail', err);
      throw err;
    });
  }catch(err){
    shower.emit('pendFail', err);
    throw err;
  }
}

// 检查微博返回
// 
function checkreply(reply){
  if(reply.error){
    if(reply.error_code == 21327 || reply.error_code == 21332){
      console.warn(tips.errortips[reply.error_code]);
      log(reply);
      takeAccessToken(function(token){
        nomsg ? apiExc(token, apiName, apiExtra) : updateStatus(token);
      });
    }else{
      shower.emit('data_error', reply);
      return false;
    }
  }else{
    log('done');
    return true;
  }
}

function exit(){
  process.exit();
}

function help(type){
  switch(type){
    case "status":
      util.puts('help status')
      break;
    default:
      util.puts(shower.color(fs.readFileSync(__dirname + '/../txt/help', 'utf8')).info);
      break;
  }
  exit();
}

//open a url
function open(url){
  var cmd, exec = require('child_process').exec;
  switch(process.platform){
  case 'darwin':
    cmd = 'open';
    break;
  case 'win32':
  case 'win64':
    cmd = 'start';
    break;
  case 'cygwin':
    cmd = 'cygstart';
    break;
  default:
    cmd = 'xdg-open';
    break;
  }
  cmd = cmd + ' ' + url + '';
  log(cmd);
  exec(cmd);
}
