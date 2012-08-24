
 
var util = require('util')
  , Emiter = require('events').EventEmitter
  ;

module.exports = Json;
util.inherits(Json, Emiter);
function Json(){
  var that = this
    ;
  
  this.on('data', function(type, data){
    console.log(JSON.stringify(data, function(key, val){return val}, 2))
  })
}

Json.description = "show data as json";