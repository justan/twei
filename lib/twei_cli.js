#!/usr/bin/env node

var util = require('util')
  , fs = require('fs')
  ;
  
var args = process.argv.slice(2)
  , TOKENPATH = './access_token'
  , ERRORCODE = {
    '21327': '你的 access token 已过期. 请重新输入一个'
  }
  ;
  
var arg, msg, img, place, coordinates, accesstoken;

while (arg = args.shift()){
  if(arg === '--help' || arg === '-h' || arg === '-?'){
    help();
  }else if(arg === '--version' || arg === '-v'){
    console.log(JSON.parse(fs.readFileSync('./package.json')).version)
    exit();
  }else if(arg === '--image' || arg === '-i'){
    img = args.shift();
    img = fs.readFileSync(process.cwd() + '/' + img);
  }else if(arg === '--place' || arg === '-p'){
    place = true;
  }else if(arg === '--coordinates' || arg === '-c'){
    coordinates = args.shift();
    place = false;
  }else if(arg === '--accesstoken' || arg === '-a'){
    accesstoken = args.shift();
  }else if(arg.indexOf("-") && !args.length){
    //最后一个参数
    msg = arg
  }
}

if(!msg){
  help();
}

checkAccessToken(accesstoken, function(token){
  updateStatus(token);
});

function checkAccessToken(token, success){
  if(!token){
    try{
      token = fs.readFileSync(TOKENPATH, 'utf8');
    }catch(e){
      saveAccessToken('');
    }
    if(!token){
    
      takeAccessToken(function(t){
        if(t){
          token = t;
          saveAccessToken(token);
          success(token);
        }else{
          takeAccessToken(arguments.callee);
        }
      });
      
    }else{
      success(token);
    }
  }else if(token === 'clear'){
    token = '';
    saveAccessToken('');
    exit();
  }else{
    saveAccessToken(token);
    success(token);
  }
}

function takeAccessToken(callback){
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  console.log('please input a weibo access token: ')
  process.stdin.on('data', function (text) {
    text = text.trim();
    process.stdin.removeListener('data', arguments.callee);
    process.stdin.pause();
    
    callback(text);
  });
}

function saveAccessToken(token){
   fs.writeFileSync(TOKENPATH, token, 'utf8');
}

function updateStatus(token){
  var opts = {
      massage: msg
    , accessToken: token
    , image: img
    , coordinates: coordinates && coordinates.split(',')
  };
  //console.log(opts);
  require('../').updateWeibo(opts).then(function(reply){
    if(reply.error){
      if(reply.error_code == 21327){
        console.log(ERRORCODE[21327])
        saveAccessToken('');
        checkAccessToken('', function(token){
          updateStatus(token);
        });
      }else{
        console.error(reply)
      }
    }else{
      console.log('done')
    }
  }, function(err){
    throw err;
  });
}

function exit(){
  process.exit();
}

function help(){
  console.log(fs.readFileSync('./doc/help', 'utf8'));
  exit();
}
