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

module.exports = color;