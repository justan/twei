/**
 * default shower
 */
 
var util = require('util')
  , Base = require('./base')
  , tips = require('../../txt/tips')
  ;

function Ashees(){
  Base.call(this);
  
  this.on('pendStart', function(){
    process.stdout.write('[ ')
  });
  this.on('pending', function(){
    process.stdout.write('\b=>')
  });
  
  this.on('pendDone', function(){
    process.stdout.write(']\n');
  });
  this.on('pendFail', function(){
    process.stdout.write('※')
  });
  
  this.on('status', function(statuses){
    statuses.statuses ? statuses.statuses.forEach(function(status){
      showStatus(status);
    }) : console.log(tips.no_item, group + '.' + name);
  });
  
  this.on('comments', function(statuses){
    statuses.comments ? statuses.comments.forEach(function(status){
      showStatus(status);
    }) : console.log(tips.no_item, group + '.' + name);
  });
}

function showStatus(status){
  var user = status.user;
  process.stdout.write(user.screen_name + '(' + user.idstr + '): ' + status.text + ' (' + status.idstr + ')[' + status. created_at + ']');
  if(status.retweeted_status){
    process.stdout.write("\n  ");
    showStatus(status.retweeted_status)
  }
  log('微博详情: ' + util.inspect(status))
  process.stdout.write('\n\n')
}

util.inherits(Ashees, Base);

module.exports = Ashees;