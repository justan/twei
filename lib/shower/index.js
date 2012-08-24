module.exports = {
  use: function(name){
    var shower;
    try{
      shower = new (require('./' + ((name != 'index' && name) || 'ashees')));
    }catch(e){
      shower = new (require('./ashees'));
      console.warn('can\'t find shower: ' + shower.color(name).warn + '. ashees instead');
      root.log && root.log(e.stack)
    }
    return shower;
  }
  , list: function(){
    var fs = require('fs')
      , path = require('path')
      , Emiter = require('events').EventEmitter
      , extReg = /\.(js|node)$/i
      , Shower
      ;
    fs.readdirSync(__dirname).forEach(function(filename){
      var ext = path.extname(filename);
      if((extReg.test(ext) || ext === '') && filename != path.basename(__filename)){
        try{
          filename = filename.replace(extReg, '');
          Shower = require('./' + filename);
          if((new Shower) instanceof Emiter){
            console.log(filename + ' - ' + (Shower.description || ''));
          }else{
            throw new Error
          }
        }catch(e){
          root.log && root.log(filename + ' isn\'t a shower');
          //root.log && root.log(e.stack);
        }
      }
    });
  }
};