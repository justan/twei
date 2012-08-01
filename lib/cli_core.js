var util = require('util')
  , fs = require('fs')
  , shower = new (require('../lib/shower').use())
  , tips = require('../txt/tips')
  ;
  
var TOKENPATH = __dirname + '/../access_token'
  , getAccessTokenUrl = function(){
    return fs.readFileSync(__dirname + '/../access_token_url', 'utf8')
  }
  , noop = function(){}
  ;

//a global var for debug
root.log = function(){};

//command info
var info = {};

//twei core commands
var cmdMap = {
  
    'help': function(type){
    help(type);
  }
  , 'execute': function(apiStr, apiExtra, apiExtra2){
    var apis = require('./api/tsina');
    var group, name;
    if(apiExtra){
      if( apiExtra.indexOf('=') ){
        if(apiExtra2){
          apiExtra = apiExtra + '&' + apiExtra2;
        }
      }else{
        paths = apiStr.split('.');
        group = paths[0];
        name = pahts[1];
        
        //if(apis[group])
        //apiExtra = 
      }
    }
    log('commend / extra: ' + apiStr + ' / ' + (apiExtra))
    apiExc(apiStr, apiExtra);
  }
  , 'authorize': function(){
    open(getAccessTokenUrl());
    takeAccessToken();
  }
  
  , 'config': function(){}
};

/**
 * 传入参数进行初始化
 * @param {Array} argvs cli 传入的参数列表. 不包括 node [--debug] twei
 */

function init(argvs){
  var args = argvs.slice();
  var cmd = args.shift(), tmp;
    
  if(tmp = checkAlias(cmd)){
    cmd = tmp.shift();
    args = tmp.concat(args);
  }
  
  if(!cmd.indexOf('-')){
    args.unshift(cmd);
    cmd = '';
  }
  
  var param = []
    , arg
    , flagsParam = {}, flag, flagFn
    , helpFn = getFlagFn('--help')
    ;
  
  while(arg = args.shift()){
    if(arg.indexOf('-')){
      if(flag){
        flagsParam[flag].push(arg);
      }else{
        param.push(arg);
      }
    }else{
      flag = arg;
      flagsParam[flag] = [];
    }
  }
  
  if(flagsParam['-d'] || flagsParam['--debug']){//提升 debug 执行顺序
    getFlagFn('-d')();
    delete flagsParam['-d'];
    delete flagsParam['--debug'];
  }
  
  log(flagsParam)
  
  for(var key in flagsParam){
    flagFn = getFlagFn(key);
    if(flagFn){
    
      if(flagFn == helpFn){//help all others param
        helpFn.apply(null, [cmd].concat(param).concat(flagsParam[key]));
      }else{
        flagFn.apply(null, flagsParam[key]);
      }
    }
  }
  
  cmdMap[cmd] ? cmdMap[cmd].apply(null, param) : help();
}


function getFlagFn(flag){
  var fn;
  switch(flag){
  case "--about":
    fn = function(){}
    break;
  case "--coordinates":
  case "-c":
    fn = function(coordinates){
      info.coordinates = coordinates;
    };
    break;
  case "--debug":
  case "-d":
    fn = function(){
      log = function(){
        console.log.apply(console, arguments);
      };
    };
    break;
  case "--force":
  case "-f":
    fn = function(){
      info.force = true;
    };
    break;
  case "--help":
  case "-h":
  case "-?":
    fn = help
    break;
  case "--image":
  case "-i":
    fn = function(url){
      if(!/^https?\:\/\//.test(url)){
        try{
          log('image path: ' + url);
          info.image = fs.readFileSync(url);
        }catch(e){
          console.warn(shower.color(tips.img_fail).warn, url);
          exit();
        }
      }else{
        info.image = url;
      }
    }
    break;
  case "--version":
  case "-v":
    fn = function(){
      console.log(JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version);
      exit();
    };
    break;
  default:
    break;
  }
  return fn;
}
  

/**
 * restore alias to core command
 */
function aliasExpand(cmdmap){
  var cmds = {};
  var alias;
  for(var key in cmdmap){
    alias = cmdmap[key];
    if(alias.alias){
      if(Array.isArray(alias.alias)){
        for(var i = 0, l = alias.alias.length; i < l; i++){
          cmds[alias.alias[i]] = cmdmap[key];
        }
      }else{
        cmds[alias.alias] = cmdmap[key];
      }
      cmds[key] = cmdmap[key];
      delete alias.alias;
    }else{
      cmds[key] = cmdmap[key];
    }
  }
  console.log(cmds);
  return cmds;
}

var aliases = aliasExpand(require('./alias.js'));
// return an Array
function checkAlias(cmd){
  var cmds;
  if(aliases[cmd]){
  
    if(typeof aliases[cmd] == 'object' && !aliases[cmd].cmd){
      throw new Error('illegal alias: ' + cmd);
    }
    
    cmds = (aliases[cmd].cmd || aliases[cmd]).trim().split(/\s+/);
    
  }
  return cmds;
}



//从控制台获取 access_token, 直至有内容输入
function takeAccessToken(callback){
  callback = callback || noop;
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdout.write(tips.input_access_token);
  process.stdin.on('data', function (text) {
    text = text.trim();
    process.stdin.removeListener('data', arguments.callee);
    process.stdin.pause();
    
    if(text){
      log('a new access token: ' + text);
      saveAccessToken(text);
      callback(text);
    }else{
      open(getAccessTokenUrl());
      takeAccessToken(callback);
    }
  });
}

function saveAccessToken(token){
   fs.writeFileSync(TOKENPATH, token, 'utf8');
   return token;
}

function getAccessToken(){
  var token;
  try{
    token = fs.readFileSync(TOKENPATH, 'utf8');
  }catch(e){
    token = ''
    saveAccessToken(token);
  }
  return token;
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
function apiExc(apiName, apiExtra){
  var token = getAccessToken();
  if(!token){
    takeAccessToken(function(){
      apiExc(apiName, apiExtra);
    });
    return false;
  }
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
    case undefined:
      util.puts(shower.color(fs.readFileSync(__dirname + '/../txt/help', 'utf8')).info);
      break;
    default:
      console.log('help: ' + util.inspect(arguments));
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


module.exports = {
    init: init
};