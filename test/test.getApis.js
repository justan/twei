var twei = require('../')
  , tsina = require('../lib/api/tsina')
  , should = require('chai').should()
  ;
  
describe("test twei's getApi interface", function(){
  describe("twei.getApiItem", function(){
    it('get statuses.home', function(){
      twei.getApiItem('statuses.home').path.should.equal(tsina.statuses.home.path || tsina.statuses.home);
    });
  });
  
  describe("twei.getApiGroup", function(){
    it('get statuses', function(){
      twei.getApiGroup('statuses').should.equal(tsina.statuses);
    });
  });
});