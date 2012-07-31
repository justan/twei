var fs = require('fs')
  , path = require('path')
  ;


var alias = {}

//twei 定义命令. 
//alias: 定义的简称
  , tAlias = {
  
//core alias
    'help': {
      cmd: '--help'
    , alias: ['-h', '?', '-?']
  }
  , 'execute': {
      cmd: '--execute'
    , alias: '-e'
  }
  , '-v': {
      cmd: '--version'
  }
  , '-i': {
      cmd: '--image'
  }
  , '-c': {
      cmd: '--coordinates'
  }
  , '-d': {
      cmd: '--debug'
  }
  , '-f': {
      cmd: '--force'
  }
  
//weibo alias
  , update: '--execute status.update'
  //查看用户
  , user: {
      cmd: '--execute user.show'
    , alias: 'whois'
  }
  
  , follow: '--execute friendships.create'
  , unfollow: '--execute friendships.destroy'
  
  , timeline: {
      cmd: '--execute statuses.home'
    , apis: 'statuses'
  }
  
  //转发
  , repost: {
      alias: ['rt', 'retweet']
    , cmd: '--execute status.repost'
  }
  
  , comment: {
      cmd: '--execute comment.comment'
    , apis: 'comment'
  }
};

alias = objMerge(alias, tAlias);

//用户自定义命令
var uAlias = fs.readdirSync(__dirname + '/user_alias');
uAlias.forEach(function(fileName){
  if('.js' == path.extname(fileName)){
    alias = objMerge(alias, require('./user_alias/' + fileName));
  }
});


function objMerge(o1, o2){
  var o3 = {};
  for(var key in o1){
    o3[key] = o1[key]
  }
  for (var key in o2){
    o3[key] = o2[key]
  }
  return o3;
}

module.exports = alias;