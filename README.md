twei
====

twei 是用 [node.js][0] 编写的微博命令行工具. 目前支持新浪微博的查看与发送.

## 环境

twei 适用于所有可运行 node.js 的环境, 包括 _windows, linux, mac os(未测试), cygwin_ 等.

## 安装

安装 [node.js][1] 后

  `npm install -g twei`
  
## 使用

```

  Usage: 
  
    twei [options] message
    twei -e apistr querystring
  
  options:
  
    --accesstoken -a: 重新设置 access_token. 
                      -a show  显示已有的 access_token
                      -a clear 将清除已有的 access_token
    --coordinates -c: 指定地理信息. 格式为: 经度,维度
    --image       -i: 附带的图片. 可以是本地路径或者 http/https URL
    --help        -h: 显示本帮助信息
    --version     -v: 显示版本信息
    --debug       -d: 显示版本信息
    --execute     -e: 执行某条 api 指令
    
  apistr:
    twei 提供的直接操作微博的接口. 格式为: apigroup.apiname
    如: 
    
      status.friends    查看你关注的人的最新微博
      one.repost        转发
      comment.comment   评论某条微博
      
  querystring
    querysting 表示前一条微博 api 的请求参数. 格式为: "count=5&page=2"
    
  Example:
    
    twei 雨一直下个不停
    twei -i ../example.png -c 114.169938,22.559385 "你好, 世界"
    twei -e status.home count=10
    
```

# 示例

  - `twei -e status.home | less` 查看最新微博
  - `twei -e status.user "screen_name=sheepmaker&count=5"` 查看某人的微博
  - `twei -e status.user count=5` 查看自己的微博
  - `twei -e comment.comment "id=202110601896455629&comment=飘过去吧"` 评论微博
  - `twei -e friends.friends screen_name=sheepmaker` 查看关注列表
  - `twei -e remind.unread` 未读通知数量
  
  
## 测试

  `npm test`
  
## access_token

  由于新浪的 [api 限制][2], 目前的 access_token 只有数天的有效期. access_token 过期后需要重新授权并输入新的 access_token. 如果你感到恼火, 我表示歉意.
  
## Apistr:

  twei 将[新浪微博的接口][4] 转接成 group.name 的 apistr 形式. 使用 [twei api][5], 在命令行中即可直接操作微博的接口.
  
  querystring 是 apistr 的额外请求参数. 所有 querysting 请参考新浪微博的[接口][4]

```
  // twei apistr --> sina
  {

    status: {
        home: 'statuses/home_timeline'
      , "public": 'statuses/public_timeline'
      , friends: 'statuses/friends_timeline'
      
      , user: 'statuses/user_timeline'
      , bilateral: 'statuses/bilateral_timeline'
      , mentions: 'statuses/mentions'
      , repost_by_me: 'statuses/repost_by_me'
      
    }
    
    , hot: {
        repost_daily: 'statuses/hot/repost_daily'
      , comment_daily: 'statuses/hot/comments_daily'
      , repost_weekly: 'statuses/hot/repost_weekly'
      , comment_weekly: 'statuses/hot/comments_weekly'
    }
    
    , one: {
        show: 'statuses/show'
      , repost: {
          path: 'statuses/repost'
        , method: 'post'
      }
      , update: {
          path: 'statuses/update'
        , method: 'post'
      }
      , destroy: {
          path: 'statuses/destroy'
        , method: 'post'
      }
    }
    , comment: {
        comment: {
          path: 'comments/create'
        , method: 'post'
      }
      , reply: {
          path: 'comments/create'
        , method: 'post'
      }
      , destroy: {
          path: 'comments/destroy'
        , method: 'post'
      }
    }
    
    , comments: {
        to_me: 'comments/to_me'
      , by_me: 'comments/by_me'
      , mentions: 'comments/mentions'
      , show: 'comments/show'
    }
    
    //关系
    , friends: {
    
        friends: 'friendships/friends'
      , in_common: 'friendships/friends/in_common'
      , bilateral: 'friendships/friends/bilateral'
      
      , followers: 'friendships/followers'
      , active: 'friendships/followers/active'
    
    }
    //提醒
    , remind: {
        unread_count: 'remind/unread_count'
    }
  }

```


[0]: http://nodejs.org/
[1]: http://nodejs.org/#download
[2]: http://open.weibo.com/wiki/Oauth2#.E8.BF.87.E6.9C.9F.E6.97.B6.E9.97.B4
[3]: https://github.com/justan/twei/blob/master/lib/shower/README.md
[4]: http://open.weibo.com/wiki/API%E6%96%87%E6%A1%A3_V2
[5]: https://github.com/justan/twei/blob/master/lib/api/tina.js
