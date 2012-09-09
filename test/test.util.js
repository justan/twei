var should = require('chai').should()
  , twei_util = require('../lib/util')
  , color = twei_util.color
  , Table = twei_util.Table
  , argParser = twei_util.argParser
  ;
  
describe("test twei's util", function(){
  describe("命令行颜色", function(){
    var startCode = '\033[%sm'
      , endCode = '\033[0m'
      , str = 'ashin'
      , red = 'red'
      ;
    
    it('`color("' + str + '", "' + red + '")` style', function(){
      color(str, red).should.equal(startCode.replace('%s', color.colors.red) + str + endCode);
    });
    
    it('`color("' + str + '", 95)` style', function(){
      color(str, 95).should.equal(startCode.replace('%s', 95) + str + endCode);
    });
    
    it('`color("' + str + ').' + red + '` style', function(){
      color(str)[red].should.equal(startCode.replace('%s', color.colors.red) + str + endCode);
    });
  });
  
  describe("表格化显示", function(){
    it('单行单列', function(){
      var t = new Table
        , output
        ;
      t.push([1234567]);
      output = t.toString();
      output.should.equal(t[0][0])
    });
    
    it('多行单列', function(){
      var t = new Table
        , output
        ;
      t.push([1234567]);
      t.push([12345678]);
      t.push([123456789]);
      output = t.toString();
      output.should.equal(t[0][0] + '\n' + t[1][0] + '\n' + t[2][0])
    });
    
    describe('多行多列', function(){
      it('一个 tab', function(){
        var t = new Table
          , output
          ;
        t.push([1234567, 12345678, 123456789]);
        t.push([1234567, 12345678, 123456789]);
        output = t.toString();
        output.should.equal(
          t[0][0] + '\t' + t[0][1] + '\t' + t[0][2] + '\n' +
          t[1][0] + '\t' + t[1][1] + '\t' + t[1][2]
        )
      });
      
      it('自动 tab', function(){
        var t = new Table
          , output
          ;
        t.push([1234567, 1234567]);
        t.push([1234567890, 1234567890]);
        t.push([1234567890123456, 1234567890]);
        t.push(['123456789012345678901234', 1234567890]);
        output = t.toString();
        output.should.equal(
          t[0][0] + '\t\t\t\t' + t[0][1] + '\n' +
          t[1][0] + '\t\t\t' + t[1][1] + '\n' +
          t[2][0] + '\t\t' + t[2][1] + '\n' + 
          t[3][0] + '\t' + t[3][1]
        )
      });
      
      it('包含全角字符', function(){
        var t = new Table
          , output
          ;
        t.push(["巴塞罗那", "天气bucuo", 123456789]);
        t.push(["1天", 1234567, 123456789]);
        output = t.toString();
        //console.log('');
        //console.log(output);
        output.should.equal(
          t[0][0] + '\t' + t[0][1] + '\t' + t[0][2] + '\n' +
          t[1][0] + '\t\t' + t[1][1] + '\t\t' + t[1][2]
        );
      });
    });
    
  });
  
  describe('命令行参数解析', function(){
    var optMap = {
        help: {
          alias: ['h', '?']
        , fn: function(){
        
        }
      }
      , version: {
          fn: function(){
            console.log('0.2.4')
          }
      }
    };
    
    argParser.optionInit(optMap);
    
    it('options parse', function(){
      var cliStr = '--version';
      
      argParser.getOptFn(cliStr).fn.should.equal(optMap.version.fn)
    });
  });
  
});