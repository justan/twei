/**
 * default shower
 */

var util = require('util')
  , Base = require('./base')
  , color = require('../util').color
  ;

util.inherits(Ashees, Base);
function Ashees(){
  var that = this;
  Base.call(this);

  this.on('pendStart', function(){
    process.stdout.write('[' + color('>').cyan)
  });

  this.on('pendEnd', function(res){
    process.stdout.write(res ? ']\n' : color('※\n').error);
  });

}

Ashees.description = "default shower";

var statusTpl = '{{name}}{{user_id}}{{text}}\n{{pic}}{{date}} | 来自{{source}}{{reposts_count}}{{comments_count}} | ID({{status_id}})';

//扩展默认颜色表
color.colors.name = color.colors.green;
color.colors.mention = 35;
color.colors.url = 94;

Ashees.prototype.pending = function(){
  process.stdout.write(color('\b=>').cyan)
};

Ashees.prototype.showStatus = function(status){
  /**
   * 重写时间样式
   * 未考虑时区显示!
   * @param {String} created_at 微博status.created_at时间字串
   * @return {String}
   */
  function showtime(created_at) {
    //补0
    function addzero(i) {
      return i<10 ? '0'+i : i
    }

    var time = new Date(created_at);
    var year = time.getFullYear();
    var month = time.getMonth() + 1;
    var date = time.getDate();
    var hour = addzero(time.getHours());
    var minute = addzero(time.getMinutes());

    var timestr = month + "月" + date + "日" + hour + ":" + minute;

    //360天前的微博显示年份
    var now = new Date();
    if (now.getTime() - time.getTime() > 31104000000) {
      return year + "年" + timestr;
    }
    return timestr;
  }

  var user = status.user || {};
  process.stdout.write(

    statusTpl.replace('{{name}}', color(user.screen_name || '').name)
    .replace('{{user_id}}', user.idstr ? '(' + color(user.idstr).grey + '): ' : '')
    .replace('{{text}}', status.text)
    .replace('{{status_id}}', color(status.idstr).grey)
    .replace('{{date}}', color(showtime(status.created_at)).grey)
    .replace('{{pic}}', status.original_pic ? '[图片: ' + status.original_pic + ']\n' : '')
    //评论数与转发数为0也会显示，评论类型的微博不会显示
    .replace('{{comments_count}}', typeof(status.comments_count)=='undefined' ? '' : ' | 评论(' + color(status.comments_count).grey +')')
    .replace('{{reposts_count}}', typeof(status.reposts_count)=='undefined' ? '' : ' | 转发(' + color(status.reposts_count).grey + ')')
    .replace('{{source}}', color((status.source || '').replace(/.+>(.+?)<\/a>$/, '$1')).grey)
    .replace(/(@[\u4e00-\u9fa5A-Za-z0-9_\-]+)/g, color('$1').mention)
    .replace(/(http\:\/\/[\w\.\/]+)/g, color('$1').url)
    .replace(/(#[\u4e00-\u9fa5A-Za-z0-9_\-\. ]+?#)/g, color('$1').url)

  );
  if(status.retweeted_status){
    process.stdout.write("\n" + color("转发微博:").cyan + "\n");
    this.showStatus(status.retweeted_status);
  }
  //log('微博详情: ' + util.inspect(status))
  !status.retweeted_status && !status.status && process.stdout.write('\n\n');
}

//评论加注
Ashees.prototype.showComment = function(comment){
  this.showStatus(comment);
  process.stdout.write("\n" + color("评论原文:").cyan + "\n");
  this.showStatus(comment.status);
};

Ashees.prototype.showRemind = function(remind){
  var strMap = {
      status: '%s 条未读微博'
    , cmt: '%s 条新评论'
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
      str += strMap[key].replace('%s', color(remind[key]).yellow) + ', '
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
