var util = require('util')
  , fs = require('fs')
  , tips = require('../txt/tips')
  , twei = require('../')
  , color = require('./util').color
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
  
  help: function(){
    var helpSeekers = [].slice.call(arguments)
      , cmd = restoreAlias(helpSeekers[0])
      ;
    
    if(cmd){
      helpSeekers.shift();
      helpSeekers = cmd.concat(helpSeekers);
    }
    
    help.apply(this, helpSeekers);
  }
  , execute: function(apiStr){
    var apiItem = twei.getApiItem(apiStr)
      , args = [].slice.call(arguments, 1), apiExtra
      , apiQs = '', expects = [], originQs = []
      , qs = require('querystring')
      ;
      
    log(arguments)
    
    while(apiExtra = args.shift()){
      if(apiExtra.indexOf('=') === -1){//以等号作为判断参数类型(expect 参数 / api query string)
        expects.push(apiExtra);
      }else{
        originQs.push(apiExtra);
      }
    }
    
    log('expects: ' + expects)
    log('originQs: ' + originQs)
    
    if(apiItem.expect){
    //实际传入的 expects 参数数量应与 apiItem 中定义的相等
      if(Array.isArray(apiItem.expect)){
        var str = '';
        
        apiItem.expect.forEach(function(expect, i){
          str += expect + '=' + (expects[i] || '') + '&';
        });
        
        log(str)
        
        apiQs = str.slice(0, str.length - 1);
      }else{
        apiQs = apiItem.expect + '=' + (expects[0] || '');
      }
    }
    
    originQs.forEach(function(qstring){
      qstring = qs.parse(qstring);
      apiQs = qs.parse(apiQs);
      
      for(var key in qstring){
        //if(apiQs[key] === undefined){
          apiQs[key] = qstring[key];//替换前面相同的参数
        //}
      }
      
      apiQs = qs.stringify(apiQs);
    });
    
    log('command / extra: ' + apiStr + ' / ' + (apiQs))
    apiExc(apiStr, apiQs);
  }
  , authorize: function(){
    console.log(tips.auth, color(getAccessTokenUrl()).green);
    open(getAccessTokenUrl());
    takeAccessToken();
  }
  , completion: function(){
    var tab = require('tabtab');
    
    return tab.complete('twei', function(err, data){
      if(err || !data) return;
      var words = Object.keys(cmdMap).concat(Object.keys(aliases)).sort();
      if(words.indexOf(data.prev) == -1 || data.prev == 'help'){
        tab.log(words, data)
      }else if(data.last.indexOf('-') === 0){
        //TODO: show options
      }
    });
  }
  , config: function(){}
};

/**
 * 传入参数进行初始化
 * @param {Array} argvs cli 传入的参数列表. 不包括 node [--debug] twei
 */

function init(argvs){
  var args = argvs.slice()
  
    , cmds = argParser(args)
    , originCmd, flagFn
    
    , cmd = cmds.cmd.name
    , param = cmds.cmd.param
    , flagsParam = cmds.opts
    
    , helpFn = argParser.getOptFn('--help')
    ;
  
  if(originCmd = restoreAlias(cmd)){
    log('alias cmd: ' + cmd)
    cmd = originCmd.shift();
    param = originCmd.concat(param);
  }
  
  if(flagsParam['-d'] || flagsParam['--debug']){//提升 debug 执行顺序
    argParser.getOptFn('-d')();
    delete flagsParam['-d'];
    delete flagsParam['--debug'];
  }
  
  log('flagsMap: ' + util.inspect(flagsParam))
  
  //cmd || help();
  
  for(var key in flagsParam){
    flagFn = argParser.getOptFn(key);
    if(flagFn){
    
      if(flagFn == helpFn){//命令行其他的参数都传给 --help 处理函数
        helpFn.apply(null, (cmd ? [cmd] : []).concat(param).concat(flagsParam[key]));
      }else{
        flagFn.apply(null, flagsParam[key]);
      }
    }
  }
  
  if(!info.shower){
    info.shower = argParser.getOptFn('--shower')();
  }
  
  cmdMap[cmd] ? cmdMap[cmd].apply(null, param) : help(cmd);
}

/**
 * twei 的参数解析
 * @param {Array} argvs 待解析的参数
 * @return {Object}
      - return.cmd 该条命令的指令
        - return.cmd.name {String} 指令名称
        - return.cmd.param {Array} 指令参数
      - return.opts 参数选项
 */
var argParser = (function(){
  var parser = function(argvs){
    var args = argvs.slice()
      , arg, opt, isbreak, flagFn
      , cmd, param = []
      , opts = {}
      ;
    
    while(arg = args.shift()){
      if(arg.indexOf('-')){//command or param
        if(cmd){
          if(isbreak){
            opts[opt].push(arg);
          }else{
            param.push(arg);
          }
        }else{
          cmd = arg
        }
      }else{//option
        opt = arg;
        opts[opt] = [];
        
        flagFn = parser.getOptFn(opt);
        if(flagFn && flagFn.length){
          isbreak = true;
        }
      }
    }
    
    return {
        cmd: {
          name: cmd
        , param: param
      }
      , opts: opts
    }
  };
  
  //取得选项参数(如: --image, -h)的处理函数
  parser.getOptFn = function(opt){
    var fn;
    switch(opt){
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
            console.warn(color(tips.img_fail).warn, url);
            exit();
          }
        }else{
          info.image = url;
        }
      }
      break;
    case "--shower":
      fn = function(showerName){
        log('use shower: ' + showerName)
        return info.shower = require('../lib/shower').use(showerName);
      };
      break;
    case "--showers":
      fn = function(){
        require('../lib/shower').list();
        exit();
      };
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
  };
  
  return parser;
})();

var aliases = require('./alias.js');

//console.log(aliases)

// return an Array
function restoreAlias(cmd){
  var cmds;
  if(aliases[cmd]){
    cmds = aliases[cmd].trim().split(/\s+/);
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

function updateStatus(opts){

  if(opts.coordinates){
    opts.coordinates = opts.coordinates.split(',')
  }
  
  return twei.updateWeibo(opts);
}

/**
 * 通用 api 执行程序
 * @param {String} apiName 格式为: group.name
 * @param {String} apiExtra 该请求的 querystring
 */
function apiExc(apiName, apiExtra){
  var token = getAccessToken()
    , apiItem = twei.getApiItem(apiName)
    , emitter
    ;
    
  if(!token){
    takeAccessToken(function(){
      apiExc(apiName, apiExtra);
    });
    return false;
  }
  try{
    var query = require('querystring').decode(apiExtra)
      ;
      
    query.access_token = token;
    log('apiExtra: ' + apiExtra);
    log('apiPath: ' + apiItem.path);
    log('query: ' + util.inspect(query));
    
    log('emit pendStart')
    info.shower.emit('pendStart');
    if(apiName == 'status.update' && info.image && query.status){
      info.accessToken = token;
      info.message = query.status;
      emitter = updateStatus(info)
    }else{
      emitter= twei.executeApi(apiName, query);
    }
    
    emitter.on('success', function(reply){
      var expire;
      
      log('event: pendEnd true')
      info.shower.emit('pendEnd', true, reply);
      
      expire = checkreply(reply, function(){
        apiExc(apiName, apiExtra);
      });
      
      if(expire){
        log('event: data')
        info.shower.emit('data', apiItem.promise, reply);
      }else if(expire === false){
        log('event: data_error')
        info.shower.emit('data', 'error', reply);
      }else{
        log('event: noAuth');
        info.shower.emit('noAuth', reply);
      }
    });
    
    emitter.on('error', function(err){
      log('event: pendEnd false')
      info.shower.emit('pendEnd', false, err);
      throw err;
    });
    
  }catch(err){
    log('event: pendEnd false')
    info.shower.emit('pendEnd', false, err);
    throw err;
  }
}

// 检查微博返回
// 
function checkreply(reply, redo){
  if(reply.error){
    if(reply.error_code == 21327 || reply.error_code == 21332){
      console.warn(tips.errortips[reply.error_code]);
      log(reply);
      takeAccessToken(redo || noops);
    }else{
      return false;
    }
  }else{
    return true;
  }
}

function exit(){
  process.exit();
}

function help(cmd){
  var args = [].slice.call(arguments)
    ;
  log('help args: ' + args);
  
  try{
  
    switch(cmd){
    
      //default simple help  
      case undefined:
      case "":
        console.log(fs.readFileSync(__dirname + '/../txt/help.md', 'utf8'), color(Object.keys(cmdMap).concat(Object.keys(aliases)).sort().join(', ')).info);
        break;
      case "execute":
        (function(){
          var helpPath = 'http://open.weibo.com/wiki/2/'
            , apiStr = args[1]
            , path = ''
            ;
          if(apiStr && (path = twei.getApiItem(apiStr))){
            console.log(tips['loading_sina_api_item'], color(path.path).yellow);
            open(helpPath + path.path);
              
          }else{
            if(apiStr){
              console.log(tips["api_not_support"], color(apiStr).warn);
            }
            console.log(fs.readFileSync(__dirname + '/../txt/help/execute', 'utf8'));
          }
        })();
        break;
      default:
        if(cmdMap[cmd]){
          console.log(fs.readFileSync(__dirname + '/../txt/help/' + cmd, 'utf8'));
        }else{
          console.log(tips['twei_dont_konw'], color(args.join(', ')).warn);
        }
        break;
    }
    
  }catch(e){
    console.log(tips['need_help'], color(cmd).green);
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
  return exec(cmd);
}


module.exports = {
    init: init
  , restoreAlias: restoreAlias
  , argParser: argParser
};