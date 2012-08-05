//微博 api

var api = {
  
  //微博列表
  statuses: {
      home: 'statuses/home_timeline'
    , "public": 'statuses/public_timeline'
    , friends: 'statuses/friends_timeline'
    
    , user: {
        path: 'statuses/user_timeline'
      , expect: 'screen_name'
    }
    , bilateral: 'statuses/bilateral_timeline'
    , mentions: 'statuses/mentions'
    , reposts: {
        path: 'statuses/repost_by_me'
      , promise: 'reposts'
    }
    
  }
  
  //单个微博操作
  , status: {
      show: {
        path: 'statuses/show'
      , expect: 'id'
    }
    , update: {
        path: 'statuses/update'
      , method: 'post'
      , expect: 'status'
    }
    , repost: {
        path: 'statuses/repost'
      , method: 'post'
      , expect: 'id'
    }
    , remove: {
        path: 'statuses/destroy'
      , method: 'post'
      , expect: 'id'
    }
  }
  
  , user: {
      path: 'users/show'
    , promise: 'user'
    , expect: 'screen_name'
  }
  
  , hot: {
      repost: 'statuses/hot/repost_daily'
    , comment: 'statuses/hot/comments_daily'
    , repost_weekly: 'statuses/hot/repost_weekly'
    , comment_weekly: 'statuses/hot/comments_weekly'
  }
    
  //评论
  , comment: {
      comment: {
        path: 'comments/create'
      , method: 'post'
      , expect: ['id', 'comment']
    }
    , reply: {
        path: 'comments/create'
      , method: 'post'
      , expect: ['id', 'cid', 'comment']
    }
    , remove: {
        path: 'comments/destroy'
      , expect: 'cid'
      , method: 'post'
    }
  }
  
  //评论列表
  , comments: {
      to_me: 'comments/to_me'
    , by_me: 'comments/by_me'
    , mentions: 'comments/mentions'
    , show: {
        path: 'comments/show'
      , expect: 'id'
    }
  }
  
  //关系
  , friends: {
  
      common: 'friendships/friends/in_common'
    , friends: {
        path: 'friendships/friends'
      , expect: 'screen_name'
    }
    , bilateral: 'friendships/friends/bilateral'
    
    , followers: {
        path: 'friendships/followers'
      , expect: 'screen_name'
    }
    , active: 'friendships/followers/active'
    
    , create: {
        path: 'friendships/create'
      , method: 'post'
      , expect: 'screen_name'
      , promise: 'user'
    }
    , destroy: {
        path: 'friendships/destroy'
      , method: 'post'
      , expect: 'screen_name'
      , promise: 'user'
    }
  
  }
  
  //通知
  , remind: {
      unread: 'remind/unread_count'
  }
};

module.exports = api;