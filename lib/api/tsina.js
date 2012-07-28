var api = {
    public_timeline: 'statuses/public_timeline'
  , friends_timeline: 'statuses/friends_timeline'
  , home_timeline: 'statuses/home_timeline'
  
  , user_timeline: 'statuses/user_timeline'
  , bilateral_timeline: 'statuses/bilateral_timeline'
  
  , comments_by_me: 'comments/by_me'
  , comments_to_me: 'comments/to_me'
  , mentions: 'comments/mentions'
  
  //关系
  , friendships: 'friendships/friends'
  , friendships_common: 'friendships/friends/in_common'
  , friendships_bilateral: 'friendships/friends/bilateral'
  
  //提醒
  , friendships_bilateral: 'remind/unread_count'
};

module.exports = api;