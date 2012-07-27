#!/usr/bin/env node

var util = require('util')
  , fs = require('fs')
  ;
  
var args = process.argv.slice(2)
  , TOKENPATH = __dirname + '/../access_token'
  , tips = JSON.parse(fs.readFileSync(__dirname + '/../txt/tips.json', 'utf8'))
  , ACCESS_TOKEN_URL = fs.readFileSync(__dirname + '/../access_token_url', 'utf8')
  ;
  
var debug = false
  , log = function(){};

var msg, img, coordinates;  
  
(function (){
  var arg;
  var place, accesstoken;
  while (arg = args.shift()){
    if(arg === '--help' || arg === '-h' || arg === '-?'){
      help();
    }else if(arg === '--version' || arg === '-v'){
      util.puts(JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version);
      exit();
    }else if(arg === '--debug' || arg === '-d'){
      debug = true; // 待完善
      log = function(){
        console.log.apply(console, arguments);
      };
    }else if(arg === '--image' || arg === '-i'){
      img = args.shift();
      if(!/^https?\:\/\//.test(img)){
        try{
          log('image path: ' + img);
          img = fs.readFileSync(img);
        }catch(e){
          console.warn(tips.img_fail, imgpath);
          exit();
        }
      }
    }else if(arg === '--place' || arg === '-p'){
      if(place === undefined){//当指定了经纬度后, 就不再使用 ip 的地理信息
        place = true;
        //TODO 实现自动附上地理信息
      }
    }else if(arg === '--coordinates' || arg === '-c'){
      coordinates = args.shift();
      place = false;
    }else if(arg === '--accesstoken' || arg === '-a'){
      accesstoken = args.shift();
    }else if(arg.indexOf("-") !== 1 && !args.length){
      //最后一个参数
      msg = arg
    }
  }
  
  if(!msg && !accesstoken){
    help();
  }

  checkAccessToken(accesstoken, function(token){
    updateStatus(token);
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
    console.log(getLoalAccessToken());
    exit();
  }else{
    saveAccessToken(token);
    success(token);
  }
}

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
  waiting();
  require('../').updateWeibo(opts).then(function(reply){
    waiting.end();
    if(reply.error){
      if(reply.error_code == 21327 || reply.error_code == 21332){
        console.warn(tips.errortips[reply.error_code]);
        log(reply);
        takeAccessToken(function(t){
          updateStatus(token);
        });
      }else{
        console.log(tips.update_fail);
        console.log(reply)
      }
    }else{
      log('done');
    }
  }, function(err){
    waiting.end();
    throw err;
  });
}

function waiting(){
  process.stdout.write('[ ')
  waiting.timer = setInterval(function(){
    process.stdout.write('\b=>')
  }, 500);
}

waiting.end = function(){
  process.stdout.write(']\n');
  clearInterval(waiting.timer);
}

function exit(){
  process.exit();
}

function help(){
  util.puts(fs.readFileSync(__dirname + '/../txt/help', 'utf8'));
  exit();
}

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
