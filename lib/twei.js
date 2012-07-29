var request = require('request')
  , util = require('util')
  , qs = require('querystring')
  , promised = require('promised-io')
  , tsina = require('./api/tsina')
  , api = tsina
  ;
  
  
/**
 * 发新浪微博
 * @param {Object} data 微博信息
 * @param {String} data.accessToken 微博 accessToken
 * @param {String} data.message 微博文本内容
 * @param {Array} [data.coordinates] 经纬度. [经度, 维度]
 * @param {Buffer|String} [data.image] 图片
 * @return {Object}
 */
function updateWeibo(data){
  if(!data.accessToken){
    throw new Error('need a accessToken');
  }
  var deferred = new promised.Deferred();
  
  var msg = data.message
    , coordinates = data.coordinates
    , img = data.image;
    
  var body = "status=" + encodeURIComponent(msg),
    url, headers, multipart;
    
  //console.log('last text: ' + msg);
  //console.log('coordinates: ' + util.inspect(coordinates));
  
  body += (coordinates && coordinates.length == 2) ? ('&lat=' + encodeURIComponent(coordinates[1]) + '&long=' + encodeURIComponent(coordinates[0])) : '';
  
  if(img){
    url = 'https://api.weibo.com/2/statuses/upload.json?access_token=' + data.accessToken;
    headers = {"content-type": "multipart/form-data"};
    body = '';
  }else{
    url = 'https://api.weibo.com/2/statuses/update.json?access_token=' + data.accessToken;
    headers = {"Content-Type": "application/x-www-form-urlencoded"};
  }
  
  if(img && !Buffer.isBuffer(img)){
    if(/^https?\:\/\//i.test(img)){
      request({url: img, encoding: null}, function(err, res, img){
        if(err){
          deferred.reject(err);
        }else{
          multipart = multipartParse(msg, coordinates, img);
          //console.log(util.inspect(multipart))
          //console.log(headers)
          faWeibo(url, headers, body, multipart, deferred);
        }
      });
    }else{
      deferred.reject('need a image');
    }
  }else{
    if(img){//buffer
      multipart = multipartParse(msg, coordinates, img);
    }
    
    faWeibo(url, headers, body, multipart, deferred);
  }
  return deferred.promise;
}

function faWeibo(url, headers, body, multipart, deferred){
  return request.post({
    url: url, 
    headers: headers,
    body: body,
    multipart: multipart
  }, function(err, res, reply){
    if(err){
      err = JSON.parse(err);
      //console.error(err.stack ? err.stack : err);
      deferred.reject(err);
    }else{
      reply = JSON.parse(reply);
      //console.log(reply);
      //console.log(typeof reply);
      //console.log(reply.text);
      deferred.resolve(reply);
    }
  });
}

function multipartParse (msg, coordinates, img){
  var multipart = [{
        'Content-Disposition': 'form-data; name="status"' 
        , body: msg
      }, {
        'Content-Disposition': 'form-data; name="pic"; filename=""'
        , body: img
      }];
      
  if(coordinates && coordinates.length == 2){
    multipart.push({
      'Content-Disposition': 'form-data; name="long"',
      body: (coordinates[0] + '').trim()
    });
    multipart.push({
      'Content-Disposition': 'form-data; name="lat"',
      body: (coordinates[1] + '').trim()
    });
  }
      
  return multipart;
}

/**
 * 执行微博 api
 * @param {Object} cmd  执行的 api 指令
 * @param {String} cmd.group   api 指令的所属分组
 * @param {String} cmd.name    api 具体指令名
 * @param {Object} opts   api 请求参数
 * @param {String} opts.access_token 所有请求必须
 */
function excuteApi(cmd, opts){
  var dfd = new promised.Deferred();
  
  var apiItem = api[cmd.group][cmd.name]
    , apiPath, method
    , token = opts.access_token
    ;
  
  delete opts.access_token;
  
  if(apiItem == undefined){
    ;
    return;
  }else if(typeof apiItem == 'string'){
    apiPath = apiItem;
  }else{
    apiPath = apiItem.path;
  }
  
  request({
      url: 'https://api.weibo.com/2/' + apiPath + '.json?access_token=' + token
    , method: method
    , qs: opts
  }, function(err, res, reply){
    if(err){
      dfd.reject(err);
    }else{
      reply = JSON.parse(reply);
      //console.log(reply.statuses);
      dfd.resolve(reply);
    }
  });
  
  return dfd.promise;
}

module.exports = {
    updateWeibo: updateWeibo
  , excuteApi: excuteApi
}
