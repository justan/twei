var request = require('request')
  , util = require('util')
  , promised = require('promised-io')
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
  return deferred;
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

function getCoordinates(ip){
  
}

module.exports = {
  updateWeibo: updateWeibo
}
