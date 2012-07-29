//微博 api
//按返回数据格式分组

var api = {
  
  //各种状态列表
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
  
  //单个微博操作
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
  
  //评论
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
  
  //评论列表
  , comments: {
      to_me: 'comments/to_me'
    , by_me: 'comments/by_me'
    , mentions: 'comments/mentions'
    , show: 'comments/show'
  }
  
  //关系
  , friends: {
  
      in_common: 'friendships/friends/in_common'
    , friends: 'friendships/friends'
    , bilateral: 'friendships/friends/bilateral'
    
    , followers: 'friendships/followers'
    , active: 'friendships/followers/active'
  
  }
  
  //提醒
  , remind: {
      unread_count: 'remind/unread_count'
  }
};

module.exports = api;