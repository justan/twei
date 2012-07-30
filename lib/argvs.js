var cmdMap = {
  
  //twei args
    help: {
      alias: ['--help', '-h']
  }
  , version: {
      alias: ['--help', '-h']
  }
  , debug: {
      alias: ['--debug', '-d']
  }
  , '--image': {
      alias: '-i'
  }
  , '--coordinates': {
      alias: '-c'
  }
  , execute: {
      alias: '-e'
  }
  , '--force': {
      alias: '-f'
  }
  
  // weibo args
  
  //发微博
  , update: {
      api: 'status.update'
  }
  //查看用户
  , user: {
      alias: "whois"
    , api: 'user.show'
  }
  , follow: {
      api: 'friendships.create'
  }
  , unfollow: {
      api: 'friendships.destroy'
  }
  , timeline: {
      api: 'statuses.home'
    , apis: 'statuses'
  }
  //转发
  , repost: {
      alias: ['rt', 'retweet']
    , api: 'status.repost'
  }
  
  , comment: {
      api: 'comment.comment'
    , apis: 'comment'
  }
};

var cmds = (function(){
  var cmds = Objects.keys(cmdMap);
  for(var cmd in cmdMap){
    if(cmdMap[cmd].path){
      if(Array.isArray(cmdMap[cmd].path)){
        cmds.concat(cmdMap[cmd].path);
      }else{
        cmds.push(cmdMap[cmd].path);
      }
    }
  }
  return cmds;
})();


function argParse(argvs){
  var args = argvs.slice()
    ;
    
  args.forEach(function(arg, i){
    if(cmds.indexOf(arg) !== -1){
      
    }else{
      
    }
  });
  
}



module.exports = argPase;