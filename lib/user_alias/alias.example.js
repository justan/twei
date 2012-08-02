// 自定义命令示例

module.exports = {
    hot: {
      alias: 'top'//hot 的等效词, 可以是一个数组或字符串
    , apis: 'hot'//扩展 api 组. 如: top.comment 可以表示 execute hot.comment
    , cmd: 'execute hot.repost count=10'// 该自定义命令对应的原始命令
  }
}