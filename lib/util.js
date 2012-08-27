/**
 * 默认颜色表.
 */

var colors = {

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
  
    - console.log(color('ashin', 'red'))
    - console.log(color('ashin', 95))
    - console.log(color('ashin').error)
    
 */
 
var color = function(str, type){
  var s, code;
  if(type){
    if(!isNaN(type) && 110 > type){
      color = type
    }else{
      color = colors[type] || 0
    }
    s = '\033[' + color + 'm' + str + '\033[0m';
  }else{
    s = new String(str);
    
    for(var key in colors){
      Object.defineProperty(s, key, {
          value: '\033[' + colors[key] + 'm' + str + '\033[0m'
        , enumerable: false
        , writable: false
      })
    }
  }
  return s;
};

color.colors = colors;

// api 参考自 (cli-table)[https://github.com/LearnBoost/cli-table]
var Table = (function(){
  var TABLEN = 8;
  var Table = function(opts){
    opts = opts || {};
    this.colWidths = opts.colWidths || [];
    this.maxWidths = this.colWidths.slice();
    opts.head && this.push(opts.head);
    this.maxWidth = opts.maxWidth;
  };
  Table.TABLEN = TABLEN;
  
  Table.prototype.__proto__ = Array.prototype;
  Table.prototype.toString = function(){
    var strs = ''
      , that = this
      , lens = []
      ;
    
    for(var i = 0, l = this.length; i < l; i++){
    
      if(this[i] instanceof Array){
        lens.push([]);
        for(var j = 0, m = this[i].length; j < m; j++){
          this[i][j] += '';
          lens[i].push(this[i][j].length + (this[i][j].match(/[^\u0000-\u00ff\uff61-\uff9f\uffe8-\uffee]/g) || '').length);
          if(this.colWidths[j]){
            if(this.colWidths[j] <= lens[i][j]){
              this[i] = this[i].slice(0, this.colWidths[j] - 4) + '...' 
            }
            
            if(this.maxWidth <= lens[i][j]){
              this[i] = this[i].slice(0, this.maxWidth - 4) + '...' 
            }
          }else{
            this.maxWidths[j] = Math.max(this.maxWidths[j] || 0, lens[i][j]);
          }
        }
        
      }else if(this[i] instanceof Object){
        //TODO 纵向列表
      }
      
    }
    
    for(var i = 0, l = this.length; i < l; i++){
      if(this[i] instanceof Array){
        for(var j = 0, m = this[i].length; j < m; j++){
          strs += this[i][j] + (function(){
            var s = Math.ceil((that.maxWidths[j] + 1) / TABLEN) - Math.floor(lens[i][j] / TABLEN), tab = '';
            while(s--){ tab += '\t' }
            return tab;
          })();
        }
        strs = strs.replace(/(\t)+$/g, '\n');
      }
    }
    return strs;
  };
  return Table
})();

module.exports = {
    Table: Table
  , color: color
};