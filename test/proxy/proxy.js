var http = require('http'),
    fs = require('fs'),
    httpProxy = require('http-proxy');

module.exports = httpProxy.createServer(function (req, res, proxy) {
  //
  // Put your custom server logic here
  //
  
  console.log('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
  
  proxy.proxyRequest(req, res, {
    host: req.headers.host,
    port: 443
  });
}).listen(8000)