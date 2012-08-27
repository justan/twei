# shower

*shower* 是 twei 的控制台主题系统. 提供了输出样式的继承机制. 通过 shower 可以重写几乎所有的内容输出.

每个 shower 应该继承自 EventEmitter.

## events

在 twei 同微博交互过程中的不同阶段会触发 shower 的不同的事件: `pendStart, pendEnd, data`

### Event: 'pendStart'
`function(){}`
开始向微博服务器发送请求

### Event: 'pendEnd'
`function(result, data){}`
请求结束. result: true/false, 成功/失败

### Event: 'data'
`function(type, data){}`
接收到服务器的正常数据. 'type' 表示返回数据的类型.