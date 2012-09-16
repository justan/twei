var fs = require('fs')
  , ini = require('ini')
  , Table = require('./util').Table
  ;
  
module.exports.Config = Config;

/**
 * 简单的 ini 配置文件读写
 * @param {String|Object} 文件路径
 * @constructor
 */

function Config(conf){
  try{
    if(typeof conf === 'string'){
      this.confPath = conf;
      conf = ini.parse(fs.readFileSync(conf, 'utf8'));
    }
  }catch(e){
    conf = {}
  }
  this.conf= conf || {};
};

Config.prototype.get = function(key){
  var keys = keyParse(key)
    , val
    ;
    
  if(keys.section){
    if(this.conf[keys.section]){
      val = this.conf[keys.section][keys.key];
    }
  }else{
    val = this.conf[key];
  }
  return val;
};

Config.prototype.set = function(key, val){
  var keys = keyParse(key)
    , conf = this.conf
    ;
  val = val || 0;
  if(keys.section){
    conf[keys.section] = typeof conf[keys.section] === 'object' ? conf[keys.section] : {};
    conf[keys.section][keys.key] = val;
  }else{
    conf[keys.key] = val;
  }
};

Config.prototype.del = function(key){
  var keys = keyParse(key);
  if(keys.section){
    if(this.conf[keys.section]){
      delete this.conf[keys.section][keys.key]
    }else{
      //console.error();
      return false;
    }
  }else{
    delete this.conf[keys.key];
  }
  return true;
};

Config.prototype.removeSection = function(key){
  if(typeof this.conf[key] == 'object'){
    delete this.conf[key];
    return true;
  }
  return false;
};

Config.prototype.list = function(){
  var table = new Table;
  
  for(var key in this.conf){
    if(typeof this.conf[key] == 'object'){
      for(var skey in this.conf[key]){
        table.push([key + '.' + skey, this.conf[key][skey]]);
      }
    }else{
      table.push([key, this.conf[key]]);
    }
  }
  
  return table.toString();
};

Config.prototype.save = function(){
  this.confPath && fs.writeFileSync(this.confPath, ini.stringify(this.conf), 'utf8');
};


function keyParse(key){
  var dotIndex = key.lastIndexOf('.')
    , section = key.slice(0, Math.max(0, dotIndex))
    , ckey = key.slice(dotIndex + 1)
    ;
  
  return {
      section: section
    , key: ckey
  }
}