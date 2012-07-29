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
    
    - `data_**` 某类数据返回
    如: 
    
      - `data_status`: 状态列表返回
      - `data_comments`: 评论列表返回
      - `data_error`: 微博 api 调用错误返回. access_token 类错误除外
      
 */
 
function Base(){
  var that = this
    , timer
    ;
  
  
  this.on('pendStart', function(){
    timer = setInterval(function(){
      that.emit('pending');
    }, 500);
  });
  this.on('pending', function(){
    
  });
  this.on('pendDone', function(){
    clearInterval(timer);
  });
  this.on('pendFail', function(){
    clearInterval(timer);
  });
  
  this.on('data', function(apiName, data){
    var group = apiName.split('.')
      , name = group[1]
      , group = group[0]
      , eventName = 'data_' + group
      ;
    log(data);
    
    if(that.listeners(eventName).length === 0){
      console.warn(this.color(tips.api_no_support).warn, group + '.' + name);
      console.log(data);
    }
    that.emit(eventName, data);
  });
  
  this.on('data_status', function(statuses){
    statuses.statuses ? statuses.statuses.forEach(function(status){
      that.showStatus(status);
    }) : console.log(tips.no_item, 'data_status');
  });
  
  this.on('data_comments', function(statuses){
    statuses.comments ? statuses.comments.forEach(function(status){
      that.showStatus(status);
    }) : console.log(tips.no_item, 'data_comments');
  });
  
  this.on('data_hot', function(statuses){
    statuses.forEach(function(status){
      that.showStatus(status);
    });
  });
  
  this.on('data_one', function(status){
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

};

/**
 * 染色
 * @param {String} str 需要上色的字符
 * @param {String} [type] 颜色品种
 * @return {String|Object}
 *
 * Example:
  
    - console.log(this.color('ashin', 'red'))
    - console.log(this.color('ashin').error)
    
 */
 
Base.prototype.color = function(str, type){
  var s;
  if(type){
    s = '\033[' + (this.colors[type] || 0) + 'm' + str + '\033[0m';
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
