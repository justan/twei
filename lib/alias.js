var fs = require('fs')
  , path = require('path')
  ;


var alias = {}

//twei 定义命令. 
//alias: 定义命令简称
  , tAlias = {
  
      update: 'execute status.update'
    , repost: 'execute status.repost'//转发
    
    //转发并评论
    , rt: {
        alias: 'retweet'
      , cmd: 'execute status.repost is_comment=1'
    }
    , status: {
        cmd: 'execute statuses.user count=10'
      , apis: 'status'
    }
    
    //查看用户
    , user: {
        cmd: 'execute user'
      , alias: 'whois'
    }
    
    , followers: 'execute friends.followers'
    , friends: {
        cmd: 'execute friends.friends'
      , apis: 'friends'
    }
    
    , follow: 'execute friends.create'
    , unfollow: 'execute friends.destroy'
    
    , timeline: {
        cmd: 'execute statuses.home count=10'
      , apis: 'statuses'
    }
    
    , comment: {
        cmd: 'execute comment.comment'
      , apis: 'comment'
    }
    
    , comments: {
        cmd: 'execute comments.show'
      , apis: 'comments'
    }
    , remind: 'execute remind'
    , hots: 'execute suggestions.hot type=1 is_pic=0 count=10'
    
    , set: 'config set'
    , get: 'config get'
    , auth: 'authorize'
  }
  ;

alias = objMerge(alias, tAlias);

//用户自定义命令
var uAlias = fs.readdirSync(__dirname + '/user_alias');
uAlias.forEach(function(fileName){
  if('.js' == path.extname(fileName)){
    alias = objMerge(alias, require('./user_alias/' + fileName));
  }
});

/**
 * restore alias to core command
 * @param {Object} cmdmap aliasmap
 * @return {Object} 返回完整的 名称:命令 对象
      Example: 
        {
            update: ''execute status.update''
          , user: 'execute user.show'
          , whois: 'execute user.show'
        }
 */
function aliasExpand(cmdmap){
  var cmds = {}
    , twei = require('../')
    , alias, apiGroup
    ;

  for(var key in cmdmap){
    alias = cmdmap[key];
    if(alias.alias){
      if(Array.isArray(alias.alias)){
        for(var i = 0, l = alias.alias.length; i < l; i++){
          cmds[alias.alias[i]] = cmdmap[key].cmd;
        }
      }else{
        cmds[alias.alias] = cmdmap[key].cmd;
      }
      cmds[key] = cmdmap[key].cmd;
      delete alias.alias;
    }else{
      cmds[key] = cmdmap[key].cmd || cmdmap[key];
    }
    
    if(alias.apis && typeof (apiGroup = twei.getApiGroup(alias.apis)) == 'object'){
      for(var apiName in apiGroup){
        if(!cmds[key + '.' + apiName]){
          cmds[key + '.' + apiName] = 'execute ' + alias.apis + '.' + apiName;
        }
      }
    }
  }
  //console.log(cmds);
  return cmds;
}


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

module.exports = aliasExpand(alias);
