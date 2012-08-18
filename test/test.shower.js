var should = require('chai').should()
  , showers = require('../lib/shower')
  ;

describe("test shower(twei's theme)", function(){
  var existShower = 'base'
    , defaultShower = 'ashees'
    , wrongShower = 'dylan'
    ;
  
  describe("use shower", function(){
    it('default shower', function(){
      showers.use().constructor.should.equal(showers.use(defaultShower).constructor);
    });
    
    it('assigned a shower', function(){
      showers.use(existShower).should.have.property('color');
    });
    
    it('a shower no exist', function(){
      showers.use(wrongShower).constructor.should.equal(showers.use(defaultShower).constructor);
    });
    
  });
  
});