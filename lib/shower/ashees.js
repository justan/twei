/**
 * default shower
 */
 
var util = require('util')
  , Base = require('./base')
  , tips = require('../../txt/tips')
  ;

util.inherits(Ashees, Base);
function Ashees(){
  var that = this;
  Base.call(this);
  
  this.on('pendStart', function(){
    process.stdout.write('[ ')
  });
  this.on('pending', function(){
    process.stdout.write(this.color('\b=>').cyan)
  });
  
  this.on('pendDone', function(){
    process.stdout.write(']\n');
  });
  this.on('pendFail', function(err){
    process.stdout.write(this.color('※').error);
  });
  
}

var statusTpl = '{{date}}({{status_id}}) from {{source}}\n{{name}}({{user_id}}): {{text}}{{pic}}|{{reposts_count}}/{{comments_count}}';

//扩展默认颜色表
Ashees.prototype.colors.name = Ashees.prototype.colors.green;
Ashees.prototype.colors.mention =35;
Ashees.prototype.colors.url = 94;

Ashees.prototype.showStatus = function(status){
  var user = status.user || {};
  process.stdout.write(
  
    statusTpl.replace('{{name}}', this.color(user.screen_name || '').name)
    .replace('{{user_id}}', user.idstr || '')
    .replace('{{text}}', status.text)
    .replace('{{status_id}}', status.idstr)
    .replace('{{date}}', this.color(status.created_at).grey)
    .replace('{{pic}}', status.original_pic ? '[pic: ' + status.original_pic + ']' : '')
    .replace('{{comments_count}}', status.comments_count || '\b')
    .replace('{{reposts_count}}', status.reposts_count || '\b')
    .replace('{{source}}', this.color((status.source || '').replace(/.+>(.+?)<\/a>$/, '$1')).grey)
    .replace(/(@[^\s\:\\\/\[\：]+)/g, this.color('$1').mention)
    .replace(/(http\:\/\/[^\s\]]+)/g, this.color('$1').url)
    .replace(/(#.+?#)/g, this.color('$1').url)
    
  );
  if(status.retweeted_status){
    process.stdout.write("\n  转自: ");
    this.showStatus(status.retweeted_status);
  }
  //log('微博详情: ' + util.inspect(status))
  process.stdout.write('\n\n')
}

Ashees.prototype.showRemind = function(remind){
  var strMap = {
      status: '%s 条未读微博'
    , cmd: '%s 条新评论'
    , follower:  '%s 个新粉丝'
    , mention_status: '%s 条新微博提到你'
    , mention_cmd: '%s 条评论提到你'
    , dm: '%s 条新私信'
    , notice: '%s 条新通知'
    , invite: '%s 个新邀请'
    , badge: '%s 个新勋章'
    , photo: '%s 条新相册消息'
    , group: '%s 条新微群消息'
  }
  , str = ''
  ;
  
  for(var key in remind){
    if(remind[key] && strMap[key]){
      str += strMap[key].replace('%s', this.color(remind[key]).yellow) + ', '
    }
  }
  if(str){
    str = '你有 ' + str.replace(/, $/, '.');
  }else{
    str = '没有任何新消息..'
  }
  console.log(str)
}

module.exports = Ashees;