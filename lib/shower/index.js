
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
};