# shower

*shower* 是 twei 的控制台主题系统. 提供了输出样式的继承机制. 通过 shower 可以重写几乎所有的内容输出.

每个 shower 应该继承自 EventEmitter.

## events

在 twei 同微博交互过程中的不同阶段会触发 shower 的不同的事件: `pendStart, pendDone, pendFail, data, data_error`

### Event: 'pendStart'
`function(){}`
开始向微博服务器发送请求

### Event: 'pendDone'
`function(){}`
微博服务器响应完成

### Event: 'pendFail'
`function(){}`
请求发送失败

### Event: 'data'
`function(type, data){}`
接收到服务器的正常数据. 'type' 表示返回数据的类型.

### Event: 'data_error'
`function(data){}`
接收到了服务器的错误返回