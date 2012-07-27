twei
====

twei 是用 [node.js][0] 编写的微博命令行工具. 目前支持发送新浪微博.

## 环境

twei 适用于所有可运行 node.js 的环境, 包括 _windows, linux, mac os, cygwin_ 等.

## 安装

安装 [node.js][1] 后

  `npm install -g twei`
  
## 使用

```

  Usage: twei [options] message
  
  options:
  
    --accesstoken -a: 重新设置 access_token. 
                      -a show  显示已有的 access_token
                      -a clear 将清除已有的 access_token
    --coordinates -c: 指定地理信息. 格式为: 经度,维度
    --image       -i: 附带的图片. 可以是本地路径或者 http/https URL
    --help        -h: 显示本帮助信息
    --version     -v: 显示版本信息
    
  Example:
    
    twei 雨一直下个不停
    twei -i ../example.png -c 114.169938,22.559385 "你好, 世界"
    
```

## 测试

  `npm test`
  
## 关于 access_token

  由于新浪的 [api 限制][2], 目前的 access_token 只有数天的有效期. access_token 过期后需要重新授权并输入新的 access_token. 如果你感到恼火, 我表示歉意.


[0]: http://nodejs.org/
[1]: http://nodejs.org/#download
[2]: http://open.weibo.com/wiki/Oauth2#.E8.BF.87.E6.9C.9F.E6.97.B6.E9.97.B4
