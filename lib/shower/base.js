var Emiter = require('events').EventEmitter
  , util = require('util')
  , tty = require('tty')
  , tips = require('../../txt/tips')
  ;

module.exports = Base;

/**
 * Default color map.
 */

exports.colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': 0
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
  , 'diff gutter': 90
  , 'diff added': 42
  , 'diff removed': 41
};

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {String} type
 * @param {String} str
 * @return {String}
 * @api private
 */

var color = exports.color = function(type, str) {
  if (!exports.useColors) return str;
  return '\033[' + exports.colors[type] + 'm' + str + '\033[0m';
};


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
  
  //数据返回
  this.on('data', function(apiName, data){
    var group = apiName.split('.')
      , name = group[1]
      , group = group[0]
      ;
    switch(group){
      case "comments":
      case 'status':
        that.emit(group, data);
        break;
      default:
        console.log(tips.api_no_support, apiName);
        break;
    }
  });
  
  //微博
  this.on('status', function(statuses){
  });
  
  //评论
  this.on('comments', function(){});
  
  //微博返回 api 调用错误. access_token 错误除外
  this.on('apiError', function(){
      console.error(tips.update_fail.error);
      console.info(reply.verbose);
  });
};

util.inherits(Base, Emiter);