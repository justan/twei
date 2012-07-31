var util = require('util')
  , fs = require('fs')
  , shower = new (require('../lib/shower').use())
  , tips = require('../txt/tips')
  ;

  
/***********/
root.log = function(){};//a global var for debug
/***********/  

var info = {};
  
//twei core commands

var cmdMap = {
  
    '--help': function(cmd){
    help(cmd)
  }
  , '--execute': function(){}
  , '--authorize': function(){}
  , '--about': function(){}
  
  , '--config': function(){}
  
  , '--version': function(){
    console.log(JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version);
    exit();
  }
  , '--debug': function(){
    log = function(){
      console.log.apply(console, arguments);
    };
  }
  , '--image': function(url){
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
  , '--coordinates': function(coordinates){
      info.coordinates = coordinates;
  }
  , '--force': function(){}
  
};

var aliases = aliasExpand(require('./alias.js'));

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
  return cmds;
}


function init(args){
  var cmd = args.shift(), tmp;
  
  cmd || help();
  
  if(tmp = checkAlias(cmd)){
  
    cmd = tmp.shift();
    args = tmp.concat(args);
    
  }
  
  var arg, param = [];
  while(arg = args.shift()){
    if(tmp = checkAlias(arg)){
      arg = tmp.shift();
      param.concat(tmp);
    }
  
    if(!arg.indexOf('-') || cmdMap[cmd] && cmdMap[cmd].length && cmdMap[cmd].length <= param.length){//next cmd
      call(cmd, param);
    }else{
      param.push(arg);
    }
  }
  call(cmd, param);
  
  function call(commamd, params){
    if(cmdMap[commamd]){
      log('call: ' + commamd)
      cmdMap[commamd].apply(null, params);
    }else{
      console.error('twei don\'t know about: ' + commamd);
    }
    cmd = arg;
    param = []
  }
}

// return Array
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

function exit(){
  process.exit();
}

module.exports = {
    init: init
  , cmdMap: cmdMap
};