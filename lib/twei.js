var request = require('request')
  , util = require('util')
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
 * @param {String} apiName  执行的 api 指令 group.name
 * @param {Object} opts   api 请求参数
 * @param {String} opts.access_token 所有请求必须
 */
function executeApi(apiName, opts){

  var dfd = new promised.Deferred()
    , apiItem = getApiItem(apiName)
    , token = opts.access_token
    , form, method, path
    ;
  
  if(!apiItem){
    process.nextTick(function(){
      dfd.reject('no or not support api: ' + apiName);
    });
    return dfd;
  }
  
  delete opts.access_token;
  
  path = apiItem.path;
  method = apiItem.method;
  
  if(method == 'post'){
    form = opts;
    opts = {};
  }
  
  request({
      url: 'https://api.weibo.com/2/' + path + '.json?access_token=' + token
    , method: method
    , qs: opts
    , form: form
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

/**
 * 取得微博 api 信息
 * @param {String} apiName 格式为: group[.name]
 * @returns {Object} api信息
    .method {String} 该 api 的http 请求方法
    .path {String} 相对路径
    .expect {String} 该 api 期望的默认参数
    .promise {String} 该 api 返回的数据类型
 */
 
function getApiItem(apiName){

  var apiItem, apiPath, method
    , group = apiName.split('.')
    , name = group[1]
    ;

  group = group[0];
  
  try{
    apiItem = name ? api[group][name] : api[group]
  }catch(e){
    return false;
  }
  
  if(apiItem == undefined){
    return false;
  }else if(typeof apiItem == 'string'){
    apiPath = apiItem;
    apiItem = {
        path: apiPath
    };
  }else if(typeof apiItem == 'object'){
  
    if(apiItem.path){
      apiPath = apiItem.path;
    }else{
    //直接使用分组名
      apiItem = apiItem[Object.keys(apiItem)[0]];
      apiPath = apiItem;
      
    }
    method = apiItem.method || 'get';
  }else{
    throw new Error('wtf.');
  }
  
  return {
      method: method
    , path: apiPath
    , expect: apiItem.expect
    , promise: apiItem.promise || group
  }
  
}

module.exports = {
    updateWeibo: updateWeibo
  , executeApi: executeApi
  , getApiItem: getApiItem
}
