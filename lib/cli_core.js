var util = require('util')
  , fs = require('fs')
  , Emitter = require('events').EventEmitter
  , tips = require('../txt/tips')
  , twei = require('../')
  , twei_util = require('./util')
  , color = twei_util.color
  , Table = twei_util.Table
  , argParser = twei_util.argParser
  ;
  
var TOKENPATH = __dirname + '/../access_token'
  , getAccessTokenUrl = function(){
    return fs.readFileSync(__dirname + '/../access_token_url', 'utf8')
  }
  , noop = function(){}
  ;

//a global var for debug
root.log = function(){};

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
    exit();
  }
  , execute: function(apiStr){
    var apiItem = twei.getApiItem(apiStr)
      , args = [].slice.call(arguments, 1), apiExtra
      , apiQs = '', expects = [], originQs = []
      , qs = require('querystring')
      ;
      
    log(arguments)
    
    while(apiExtra = args.shift()){
      if(!/[^\\]=/.test(apiExtra)){//以等号作为判断参数类型(expect 参数 / api query string)
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
          if(expect == 'status' || expect == 'comment'){
            expects[i] = encodeURIComponent(expects[i].replace(/\\(?=[^\\])/g, ''));
          }
          str += expect + '=' + (expects[i] || '') + '&';
        });
        
        
        apiQs = str.slice(0, str.length - 1);
      }else{
        if(apiItem.expect == 'status' || apiItem.expect == 'comment'){
          expects[0] = encodeURIComponent(expects[0].replace(/\\(?=[^\\])/g, ''));
        }
        apiQs = apiItem.expect + '=' + (expects[0] || '');
      }
      log('query string: ' + apiQs)
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
    return apiExc(apiStr, apiQs);
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
  , config: config
};

var optionMap = {
    coordinates: {
      alias: 'c'//缩写
    , fn: function(coo){
      optInfo.coordinates = coo && coo.split(',');
    }
  }
  , debug: {
      alias: 'd'
    , fn: function(){//处理函数
        log = function(){
          console.log.apply(console, arguments);
        };
    }
  }
  , filter: {//指定显示的字段
      fn: function(filter){
        if(arguments.length){
          optInfo.quiet = true;
        }
      }
  }
  , help: {
      alias: ['h', '?']
    , fn: help
  }
  , image: {
      alias: 'i'
    , fn: function(url){
        if(!/^https?\:\/\//.test(url)){
          try{
            log('image path: ' + url);
            optInfo.image = [fs.readFileSync(url)];
          }catch(e){
            console.warn(color(tips.img_fail).warn, url);
            exit(2);
          }
        }
    }
  }
  , quiet: {}//除了正常数据, 不做任何其他输出
  , shower: {
      fn: function(showerName){
        log('use shower: ' + showerName)
        return optInfo.shower = require('../lib/shower').use(showerName);
      }
  }
  , showers: {
      fn: function(){
        require('../lib/shower').list();
        exit();
      }
  }
  , version: {
      alias: 'v'
    , fn: function(){
        console.log(JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version);
        exit();
    }
  }
};

/**
 * 传入参数进行初始化
 * @param {Array} argvs cli 传入的参数列表. 不包括 node [--debug] twei
 */

function init(argvs){
  var args = argvs.slice()
    ;
  
  for(var i = 0, l = args.length; i < l; i++){
    if(args[i].indexOf('-')){
      args.splice.apply(args, [i, 1].concat(restoreAlias(args[i]) || [args[i]]))
      break;
    }
  }
  
  var cmds = argParser(args)
    , flagFn
    
    , cmd = cmds.name
    , param = cmds.param
    , flagsParam = cmds.opts
    , extras = cmds.extras
    ;
  
  for(var opt in cmds.extras){//选项参数表中没有列出的, 都当做微博 api 参数
    param.push(opt.replace(/^--?/, '') + '=' + encodeURIComponent(cmds.extras[opt][0] || ''));
  }
  
  if(flagsParam['-d'] || flagsParam['--debug']){//提升 debug 执行顺序
    argParser.getOptFn('-d')();
    delete flagsParam['-d'];
    delete flagsParam['--debug'];
  }
  
  log('cmds: ' + util.inspect(cmds));
  
  for(var key in flagsParam){
    flagFn = argParser.getOptFn(key);
    if(flagFn){
    
      if(flagFn == argParser.getOptFn('--help')){//命令行其他的参数都传给 --help 处理函数
        flagFn.apply(null, (cmd ? [cmd] : []).concat(param).concat(flagsParam[key]));
        exit();
      }else{
        flagFn.apply(null, flagsParam[key]);
      }
    }
  }
  
  if(!optInfo.shower){
    optInfo.shower = argParser.getOptFn('--shower')();
  }
  
  cmdMap[cmd] ? cmdMap[cmd].apply(null, param) : (function(){help(cmd);exit(1)})();
}

argParser.optionInit(optionMap);
var optInfo = argParser.optInfo

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

function config (action, key){
  var ini = require('ini')
    , configPath = process.env.HOME + '/.tweirc'
    ;
  
  switch(action){
  case 'get':
    (function(){
      var val = ''
        , keys = key.trim().split('.')
        , conf
        ;
      
      // try{
        // conf = ini.parse(fs.readFileSync(configPath, 'utf8'));
      // }catch(e){
        // conf = ini.parse(fs.readFileSync(__dirname + '/../tweirc', 'utf8'));
      // }
      
      //console.log(val);
    })();
    break;
  case 'set':
    break;
  case 'list':
    try{ console.log(fs.readFileSync(configPath, 'utf8')) }catch(e){}
    
    console.log(fs.readFileSync(__dirname + '/../tweirc', 'utf8'))
    break;
  case undefined:
    help('config');
    break;
  default:
    break;
  }
  
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

/**
 * 通用 api 执行程序
 * @param {String} apiName 格式为: group.name
 * @param {String} apiExtra 该请求的 querystring
 * @return {EventEmitter}
    events:
      - 'pendStart'
      - 'pendEnd'
      - 'data'
      - 'noAuth' access_token 无效或者过期
      - 'retry' 
  
 */
function apiExc(apiName, apiExtra){
  var token = getAccessToken()
    , apiItem = twei.getApiItem(apiName)
    , weiboEmitter
    , emitter = new Emitter
    ;
    
  process.nextTick(function(){
    var query = require('querystring').decode(apiExtra)
      ;
      
    query.access_token = token;
    log('apiExtra: ' + apiExtra);
    log('apiPath: ' + apiItem.path);
    log('query: ' + util.inspect(query));
    
    emitter.emit('pendStart');
      
    if(apiName == 'status.update' && optInfo.image && optInfo.image.length && query.status){
      weiboEmitter = twei.updateWeibo({
          accessToken: token
        , message: query.status
        , image: optInfo.image[0]
        , coordinates: optInfo.coordinates
      });
    }else{
      weiboEmitter = twei.executeApi(apiName, query);
    }
    
    weiboEmitter.on('success', function(reply){
      var isLive
        , showData = [], outStr = ''
        ;
      
      emitter.emit('pendEnd', true, reply);
      
      log(reply);
      isLive = checkreply(reply);
      
      if(isLive){
        if(optInfo.filter){
          optInfo.filter.forEach(function(filterStr){
            showData.push(filter(reply, filterStr.trim().split('.')));
          });
          
          function filter(target, keys){
            var keys = keys.slice()//拷贝一份, 防止递归调用影响到上一级的 keys
              , key
              , ret = []
              , self = arguments.callee
              ;
            
            if(keys && keys.length){
              key = keys.shift();
              if(target instanceof Array){
                
                target.forEach(function(item){
                  if(key in item){
                    ret = ret.concat(self(item[key], keys));
                  }
                });
              
              }else if(typeof target == 'object'){
                ret = self(target[key], keys);
              }else{
                ret = [];
              }
            }else{
              ret = [target];
            }
            
            return ret;
          }
          
          if(showData.length == 1){
            outStr = showData[0].join('\n');
          }else{
            (function(){
              var tData = {}
                , group
                ;
                
              showData.forEach(function(item){
                tData[item.length] = tData[item.length] || [];
                item.forEach(function(val, row){
                  tData[item.length][row] = tData[item.length][row] || [];
                  tData[item.length][row].push(val);
                });
              });
              
              for(var len in tData){
                if(len === '1'){
                  group = new Table;
                  group.push(tData[len][0])
                  outStr += group.toString() + '\n';
                }else{
                  group = new Table;
                  tData[len].forEach(function(d){
                    group.push(d);
                  });
                  outStr += group.toString() + '\n';
                }
              }
              
            })();
          }
          console.log(outStr);
          if(!outStr || outStr.replace(/\s+/, '') * 1 === 0){//没有想要的字段, 或者全为 0 的时候
            exit(3);
          }
        }else{
          emitter.emit('data', apiItem.promise, reply);
        }
      }else if(isLive === false){
        emitter.emit('data', 'error', reply);
        exit(4);
      }else{
        emitter.emit('noAuth', reply);
        log('event: noAuth');//需要登录
        takeAccessToken(function(){
          emitter.emit('retry', apiExc(apiName, apiExtra));
        });
      }
    });
    
    weiboEmitter.on('error', function(err){
      emitter.emit('pendEnd', false, err);
    });
  });
  return emitter.on('pendStart', function(){
    if(optInfo.quiet) return;
    log('event: pendStart')
    optInfo.shower.emit('pendStart');
  }).on('pendEnd', function(result, replyOrError){
    if(optInfo.quiet) return;
    log('event: pendEnd ' + result);
    optInfo.shower.emit('pendEnd', result, replyOrError);
  }).on('data', function(type, reply){
    if(optInfo.quiet && type === 'error') return;
    log('event: data_' + type);
    optInfo.shower.emit('data', type, reply);
  });
}

// 检查微博返回
// 
function checkreply(reply, redo){
  if(reply.error){
    if(reply.error_code == 21327 || reply.error_code == 21332){
      console.warn(tips.errortips[reply.error_code]);
      //log(reply);
      //takeAccessToken(redo || noop);
      return;
    }else{
      return false;
    }
  }else{
    return true;
  }
}

function exit(code){
  process.exit(code);
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

/*
 进程退出状态码(`twei [command] ; echo $?`):
 0: 命令执行成功
 1: 没有 twei 指令或者指令不正确
 2: 读取本地图片失败
 3: '--filter [filter strings]' 没有匹配内容或者结果全是 0 
 4: 微博请求返回错误
 */