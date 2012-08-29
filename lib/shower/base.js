var Emiter = require('events').EventEmitter
  , util = require('util')
  , tips = require('../../txt/tips')
  , Table = require('../util').Table
  ;

module.exports = Base;

util.inherits(Base, Emiter);

/**
 * base shower. 
 * @constructor
 * Events: 
    
    - `pendStart`: 异步调用看开始. 比如开始请求数据
    - `pendEnd`: 异步调用成功完成. 传入事件监听函数两个参数: 请求结果, 数据/错误信息
    - `data`: 数据返回
      
 */
 
function Base(){
  var that = this
    ;
  
  this.pendStep = 500;
  
  this.on('pendStart', function(){
    this.pendTimer = setInterval(function(){
      that.pending && that.pending();
    }, this.pendStep);
  });
  this.on('pendEnd', function(res){
    clearInterval(this.pendTimer);
  });
  
  this.on('data', function(type, data){
    that.rendData(type, data);
  });
  
};

Base.description = "base shower";

//数据展示
Base.prototype.rendData = function(type, reply){
  var that = this;
  
  switch(type){
  case 'statuses':
    (function(statuses){
      statuses.statuses ? statuses.statuses.forEach(function(status){
        that.showStatus(status);
      }) : console.log(tips.no_item, 'data_status');
    })(reply);
    break;
  
  case 'comments':
    (function(statuses){
      statuses.comments.forEach(function(comment){
        that.showComment(comment);
      });
    })(reply);
    break;
  
  case 'hot': 
    (function(statuses){
      statuses.forEach(function(status){
        that.showStatus(status);
      });
    })(reply);
    break;
  
  case 'status': 
    (function(status){
      that.showStatus(status);
    })(reply);
    break;
  
  case 'comment': 
    (function(status){
      status.retweeted_status = status.status;
      that.showStatus(status);
    })(reply);
    break;
  
  case 'error': 
    (function(err){
        //console.error(tips.update_fail);
        console.info(err.error);
    })(reply);
    break;
  
  case 'user': 
    that.showUser(reply, true);
    break;
  
  case 'friends': 
    that.showUsers(reply);
    break;
  
  case 'remind':
    (function(remind){
      that.showRemind(remind);
    })(reply);
    break;
  
  case 'suggestions_statuses':
    (function(statuses){
      statuses.statuses.forEach(function(status){
        that.showStatus(status.status);
      });
    });
    break;
    
  // no shower display this type
  default:
    console.warn(tips.api_no_shower, type);
    console.log(reply);
    break;
  }
};

/**
 * 微博展示.
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
};

Base.prototype.showComment = function(comment){
  this.showStatus(comment);
  process.stdout.write('  原帖: ');
  this.showStatus(comment.status);
};

var userKey = {
    idstr: "ID"
  , screen_name: "昵称"
  , location: "地址"
  //, description: "简介"
  //, url: "主页"
  , gender: "性别"
  , followers_count: "粉丝"
  , friends_count: "关注"
  , statuses_count: "微博"
  //, created_at: "注册日期"
  , verified: "V"
  , online_status: "在线状态"
};

Base.prototype.showUsers = function(users){
  var that = this
    , head = []
    , table
    ;
    
  console.log('total: ' + users.total_number);
  
  for(var key in userKey){
    head.push(userKey[key]);
  }
  table = new Table({head: head, maxWidth: 15});
  
  users.users.forEach(function(user, i){
    var row = [];
    for(var key in userKey){
      row.push(user[key]);
    }
    table.push(row);
  });
  console.log(table.toString());
};

Base.prototype.showUser = function(user, hasHead){
  var head = ''
    , row = ''
    , lens = {}
    ;
  
  for(var key in userKey){
    row += user[key] + '\t';
    head += userKey[key] + '\t';
  }
  
  hasHead && console.log(head);
  console.log(row);
  user.status && this.showStatus(user.status);
};

Base.prototype.showRemind = function(remind){
  var tab = new Table
    ;
  for(var key in remind){
    tab.push([key, remind[key]]);
  }
  console.log(tab.toString())
};
