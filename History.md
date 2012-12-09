# 0.2.5 / 2012-12-9
  
  - config 命令
  - twei 微博相关函数 `cmdMap.execute` 现在返回一个 emiter
  - 整理了程序退出状态码
  - 将 access_token 移至用户目录保存
  - mac os 测试

# 0.2.4 / 2012-9-5

  - 新增选项:
    - `--showers` 选项显示所有 shower
    - `--quiet` 禁用等待动画
    - `--filter` 过滤显示字段
  - 新增 'json' shower. eg: `twei remind --shower json`
  - 新的 'querystring' 参数格式支持. eg: `twei update --status "lucy in the sky with diamond"`
  - 默认 shower 的改进(感谢 @lyonna)
  - bugs fixed: 编码微博和评论内容 fixed #7

# 0.2.3 / 2012-8-18
  
  - bash 和 zsh 自动补全
  - 改进 shower

# 0.2.2 / 2012-8-15
  
  - `help` 命令的支持
  - `comment.reply` 的修复
  - `hots` alias 的添加
  - ashees 有了更好的超链接匹配