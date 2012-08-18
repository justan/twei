var Emiter = require('events').EventEmitter
  , util = require('util')
  , tips = require('../../txt/tips')
  ;

module.exports = Base;

util.inherits(Base, Emiter);

/**
 * base shower. 所有 shower 都应该继承该类
 * @constructor
 * Events: 
    
    - `pendStart`: 异步调用看开始. 比如开始请求数据
    - `pending`: 动画显示用
    - `pendDone`: 异步调用成功完成
    - `pendFail`: 异步调用失败
    - `data`: 数据返回
    
    - `data_*` 某类数据返回
    如: 
    
      - `data_status`: 状态列表返回
      - `data_comments`: 评论列表返回
      - `data_error`: 微博 api 调用错误返回. access_token 类错误除外
      
 */
 
function Base(){
  var that = this
    ;
  
  
  this.on('pendStart', function(){
    this.pendTimer = setInterval(function(){
      that.emit('pending');
    }, 500);
  });
  this.on('pending', function(){
    
  });
  this.on('pendDone', function(){
    clearInterval(this.pendTimer);
  });
  this.on('pendFail', function(){
    clearInterval(this.pendTimer);
  });
  
  this.on('data', function(type, data){
    var type = 'data_' + type;
    
    log(data);
    
    if(that.listeners(type).length === 0){
      console.warn(this.color(tips.api_no_shower).warn, type);
      console.log(data);
    }
    that.emit(type, data);
  });
  
  this.on('data_statuses', function(statuses){
    statuses.statuses ? statuses.statuses.forEach(function(status){
      that.showStatus(status);
    }) : console.log(tips.no_item, 'data_status');
  });
  
  this.on('data_comments', function(statuses){
    statuses.comments.forEach(function(comment){
      that.showComment(comment);
    });
  });
  
  this.on('data_hot', function(statuses){
    statuses.forEach(function(status){
      that.showStatus(status);
    });
  });
  
  this.on('data_status', function(status){
    that.showStatus(status);
  });
  
  this.on('data_comment', function(status){
    status.retweeted_status = status.status;
    that.showStatus(status);
  });
  
  this.on('data_error', function(err){
      //console.error(tips.update_fail);
      console.info(this.color(err.error).error);
  });
  
  this.on('data_user', function(user){
    that.showUser(user);
  });
  
  this.on('data_friends', function(users){
    console.log(this.color(users.total_number).l_red + ' followers')
    users.users.forEach(function(user){
      that.showUser(user);
    })
  });
  
  this.on('data_remind', function(remind){
    that.showRemind(remind);
  });
  
  this.on('data_suggestions_statuses', function(statuses){
    statuses.statuses.forEach(function(status){
      that.showStatus(status.status);
    });
  });
};

/**
 * 微博展示. 子 shower 可重写覆盖此方法
 * @param {Objext} status 微博数据
 */
Base.prototype.showStatus = function(status){
  var user = status.user;
  process.stdout.write(user.screen_name + ': ' + status.text);
  if(status.retweeted_status){
    process.stdout.write("\n  from: ");
    this.showStatus(status.retweeted_status);
  }
  process.stdout.write('\n')
}

Base.prototype.showComment = function(comment){
  this.showStatus(comment);
  process.stdout.write('  原帖: ');
  this.showStatus(comment.status);
};

Base.prototype.showUser = function(user){
  console.log(
    this.color(user.screen_name).info + '[' + user.followers_count + '/' + 
        user.friends_count + '/' + user.statuses_count + '](' + user.idstr + 
        ')[http://weibo.com/' + user.profile_url + (user.url ? (' ' + user.url) : '') + ']'
  );
  user.status && this.showStatus(user.status);
}

Base.prototype.showRemind = function(remind){
  console.log(
      "你有 %s 条未读微博, %s 条新评论, %s 个新粉丝, %s 条新微博提到你, %s 条评论提到你, %s 条新私信, %s 条新通知, %s 个新邀请, %s 个新勋章, %s 条新相册消息, %s 条新微群消息"
    , remind.status
    , remind.cmt
    , remind.follower
    , remind.mention_status
    , remind.mention_cmt
    , remind.dm
    , remind.notice
    , remind.invite
    , remind.badge
    , remind.photo
    , remind.group
  );
}

/**
 * 默认颜色表.
 */

Base.prototype.colors = {

    'default': 0
    
  , 'black': 30
  
  , 'red': 31
  , 'error': 31
  
  , 'green': 32
  , 'info': 32
  
  , 'yellow': 33
  , 'warn': 33
  
  , 'blue': 34
  
  , 'magenta': 35
  , 'cyan': 36
  , 'white': 37
  
  , 'bgblack': 40
  ,	'bgred': 41
  , 'bggreen': 42
  , 'bgyellow': 43
  , 'bgblue': 44
  , 'bgmagenta': 45
  , 'bgcyan': 46
  , 'bgwhite': 47
  
  , 'grey': 90
  , 'l_red': 91
  , 'l_green': 92
  , 'l_yellow': 93
  , 'l_blue': 94

};

/**
 * 染色
 * @param {String} str 需要上色的字符
 * @param {String|Number} [type] 颜色品种|ansi 颜色码
 * @return {String|Object}
 *
 * Example:
  
    - console.log(this.color('ashin', 'red'))
    - console.log(this.color('ashin').error)
    
 */
 
Base.prototype.color = function(str, type){
  var s, code;
  if(type){
    if(!isNaN(type) && 110 > type){
      color = type
    }else{
      color = this.colors[type] || 0
    }
    s = '\033[' + color + 'm' + str + '\033[0m';
  }else{
    s = new String(str);
    
    for(var key in this.colors){
      Object.defineProperty(s, key, {
          value: '\033[' + this.colors[key] + 'm' + str + '\033[0m'
        , enumerable: false
        , writable: false
      })
    }
  }
  return s;
};
