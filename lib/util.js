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
    return strs.replace(/\s+$/, '');
  };
  return Table
})();

/**
 * twei 的参数解析
 * @param {Array} argvs 待解析的参数
 * @return {Object}
      - return.cmd 该条命令的指令
        - return.cmd.name {String} 指令名称
        - return.cmd.param {Array} 指令参数
      - return.opts {Object} 参数选项
      - return.extras {Object} 未经 optionInit 注册的选项
 */
var argParser = (function(){
  var parser = function(argvs){
    var args = argvs.slice()
      , arg, opt, isbreak, flagFn, cursor
      , ret = {
            name: ''
          , param: []
          , opts: {}
          , extras: {}
        }
      ;
    
    while(arg = args.shift()){
      if(arg.indexOf('-')){//command or param
        if(ret.name){
          if(isbreak){
            ret[cursor][opt].push(arg);
          }else{
            ret.param.push(arg);
          }
        }else{
          ret.name = arg;//第一个不带 '-' 的就是 twei 命令
        }
      }else{//option
        if(arg.indexOf('--')){//选项连写的支持. eg: -vd 
          arg.length >= 3 && args.unshift('-' + arg.slice(2));
          arg = arg.slice(0, 2);
        }
      
        opt = arg;
        
        flagFn = parser.getOptFn(opt);
        
        if(flagFn){//经过 optionInit 初始化注册的
          cursor = 'opts';
          isbreak = !!flagFn.len;//是否接受参数
        }else{
          cursor = 'extras';
          isbreak = true;
        }
        ret[cursor][opt] = [];
      }
    }
    
    return ret;
  };
  var optionMap = {};
  
  parser.optInfo = {};
  
  //选项参数初始化
  parser.optionInit = function(optMap){
    var optItem
      ;
    for(var opt in optMap){
      optItem = optMap[opt];
      optionMap['--' + opt] = (function(opt, optItem){
        var optFn = function(){
          var args = [].slice.call(arguments)
            ;
          //每一个在 optMap 中的选项处理函数调用时会自动将其参数列表添加到 parser.optInfo 中
          if(args.length){ parser.optInfo[opt] = args.length ? args : true }
          return optItem.fn.apply(optItem, args);
        };
        optFn.fn =  optItem.fn || function(){};
        optFn.len = optFn.fn.length;
        optFn.optionName = opt;
        optFn._originItem = optItem;
        
        return optFn;
      })(opt, optItem);
      
      if(optItem.alias){
        if(optItem.alias instanceof Array){
          optItem.alias.forEach(function(alias){
            optionMap['-' + alias] = optionMap['--' + opt];
          });
        }else{
          optionMap['-' + optItem.alias] = optionMap['--' + opt];
        }
      }
    }
    
    //console.log(optionMap)
  };
  
  //取得选项参数(如: --image, -h)的处理函数
  parser.getOptFn = function(opt){
    return optionMap[opt];
  };
  
  return parser;
})();

//open a url
function open(url, callback){
  var cmd, exec = require('child_process').exec;
  switch(process.platform){
  case 'darwin':
    cmd = 'open';
    break;
  case 'win32':
  case 'win64':
    cmd = 'start ""';//加空的双引号可以打开带有 "&" 的地址
    break;
  case 'cygwin':
    cmd = 'cygstart';
    break;
  default:
    cmd = 'xdg-open';
    break;
  }
  cmd = cmd + ' ' + url + '';
  return exec(cmd, callback);
}

module.exports = {
    Table: Table
  , color: color
  , argParser: argParser
  , open: open
};