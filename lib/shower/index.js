var util = require('util')
  , showers = {
      base: './base'
    , ashees: './ashees'
  }
  ;

module.exports = {
  use: function(name){
    return require(showers[name] || showers['ashees']);
  }
};