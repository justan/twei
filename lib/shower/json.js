
 
var util = require('util')
  , Emiter = require('events').EventEmitter
  ;

module.exports = Json;
util.inherits(Json, Emiter);
function Json(){
  var that = this
    , procs = ['-', '\\', '|', '/']
    , i = 0
    ;
  
  this.on('pendStart', function(){
    this.pendTimer = setInterval(function(){
      that.emit('pending');
    }, 100);
  });
  this.on('pending', function(){
    process.stdout.write('\b' + procs[i % procs.length])
    i++;
  });
  this.on('pendEnd', function(){
    process.stdout.write('\b');
    clearInterval(this.pendTimer);
  });
  
  this.on('data', function(type, data){
    console.log(JSON.stringify(data, function(key, val){return val}, 2))
  })
}

Json.description = "show data as json";