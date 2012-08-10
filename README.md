twei
====

twei 是用 [node.js][0] 编写的微博命令行工具. 目前支持新浪微博的查看与发送.

## 环境

twei 适用于所有可运行 node.js 的环境, 包括 _windows, linux, mac os(未测试), cygwin_ 等.

## 安装

  1. 安装 [node.js][1]
  2. 在命令行中: `npm install -g twei`
  3. `twei --version`
  
## 使用

```

  nodejs 命令行微博工具
    
  Usage: twei [command]
    
  Command:
    支持的命令包括: 
    authorize, execute, help, 
    comment, follow, followers, unfollow, update, repost,
    status, user, hot, remind

  Example:
    twei remind
    twei timeline
    twei update 雨一直下个不停
    twei update "你好, 世界" -i ../example.png -c 114.169938,22.559385

```

## 测试

  `npm test`
  
## access_token

  由于新浪的 [api 限制][2], 目前的 access_token 只有数天的有效期. Access_token 过期后需要输入你[重新授权][6]后的新 access_token. 

## 示例
  
  - 查看提醒: `twei remind`
  - 更新微博
  
    - 发微博: `twei update 雨一直下个不停`
    - 发带网络图片的微博: `twei update 雨一直下个不停 -i http://example/example.png`
    - 发带本地图片的微博: `twei update 雨一直下个不停 -i ./example.png`
    
  - timeline
  
    - 查看收到的微博: `twei timeline`
    - 查看自己的微博: `twei timeline.user`
    - 查看某人的微博: `twei timeline.user sheepmaker`
    - 查看@你的微博: `twei timeline.mentions`
    
  - 查看某人信息: `twei user sheepmaker`
  - 查看某人的粉丝: `twei followers sheepmaker`
  - 查看 follow 那些人: `twei friends sheepmaker`
  - follow 某人: `twei follow sheepmaker`
  - 评论
  
    - 查看@你的评论: `twei comments.mentions`
    - 查看你发出评论: `twei comments.by_me`
    - 查看给你的评论: `twei comments.to_me`
    - 查看某条微博的评论: `twei comments {{id}}`
    - 评论微博: `twei comment {{id}} {{comment}}`
    - 删除评论: `twei comment.remove {{id}}`
    - 回复评论: `twei comment.reply {{id}} {{cid}} {{comment}}`
    
## execute

  相比上面的示例, twei 提供了功能更为完整的微博命令行接口 execute. 使用 execute 命令可以执行较为完整的微博 api 接口.
  
  Usage: `twei execute {{apistr}} {{querystring}}`
  
### apistr & querystring:

  twei 将[新浪微博的接口][4] 转接成 group.name 的 apistr 形式. 使用 [twei api][5], 在命令行中即可直接操作微博的接口.
  
  querystring 是 apistr 的请求参数. querystring 可以是普通的请求字符串格式(uid=1488292340), 如果该条 api 定义了expect, querysting 可以省去请求参数头部分(前例中的 "uid=" 部分). 完整的 querysting 请参考新浪微博的[接口][4]
  
  Usage: `twei timeline.home count=2 page=2` or `twei timeline.home "count=2&page=2"`, 
         `twei execute statuses.user sheepmaker count=5 page=2 feature=1` 

         
## 自定义

  alias 和 shower 是 twei 提供的自定义命令和样式功能. 
  
  - [command alias][7] 可以将常用命令改写成较短的命令. 
  - 默认的 twei 只提供了有限类型的数据. 通过 shower 则可以自定义内容的显示样式. 自定义的 shower 可以通过 `--shower` 指定使用.
    Example: `twei timeline --shower base`

## 联系

  如果你对 twei 有任何的建议, 可以使用 [issue][8], 或者直接联系 [@sheepmaker][9]
  
    

[0]: http://nodejs.org/
[1]: http://nodejs.org/#download
[2]: http://open.weibo.com/wiki/Oauth2#.E8.BF.87.E6.9C.9F.E6.97.B6.E9.97.B4
[4]: http://open.weibo.com/wiki/API%E6%96%87%E6%A1%A3_V2
[5]: https://github.com/justan/twei/blob/master/lib/api/tsina.js
[6]: https://api.weibo.com/oauth2/authorize?client_id=3811884266&redirect_uri=http%3A%2F%2Fprojects.whosemind.net%2Ftwei%2Ftsina_access_token.html&response_type=token
[7]: https://github.com/justan/twei/blob/master/lib/user_alias/alias.example.js
[8]: https://github.com/justan/twei/issues/new
[9]: http://weibo.com/urmaker