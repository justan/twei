var util = require('util')
  , themes = {
      ashees: './ashees'
  }
  ;

module.exports = {
  use: function(themeName){
  
    themeName = themeName || 'ashees';
    return require(themes[themeName] || themes['ashees']);
  }
};