const express = require('express')
const app = express()

//引入ship接口
const shipinfo = require('./routes/api/ship')
const shipdata = require('./routes/api/shipdata')

//数据库配置
const mongoose = require('mongoose')

//数据库连接
var url = 'mongodb://localhost:27017/shipdata'
mongoose.connect(url,{useNewUrlParser:true}).then(() => console.log('服务器连接成功')).catch(err => console.log(err));

//use routes
app.use('/api/ship',shipinfo)
app.use('/api/shipdata',shipdata)

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`服务器开启在${port}端口`)
})