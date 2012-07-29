var api = {
  status: {
      "public": 'statuses/public_timeline'
    , friends: 'statuses/friends_timeline'
    , home: 'statuses/home_timeline'
    
    , user: 'statuses/user_timeline'
    , bilateral: 'statuses/bilateral_timeline'
    , mentions: 'statuses/mentions'
    , repost_by_me: 'statuses/repost_by_me'
  }
  
  , comments: {
      by_me: 'comments/by_me'
    , to_me: 'comments/to_me'
    , mentions: 'comments/mentions'
  }
  
  //关系
  , friendships: 'friendships/friends'
  , friendships_common: 'friendships/friends/in_common'
  , friendships_bilateral: 'friendships/friends/bilateral'
  
  //提醒
  , remind: {
      unread_count: 'remind/unread_count'
  }
};

module.exports = api;