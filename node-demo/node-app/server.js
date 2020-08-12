const express = require('express')
const bodyParser = require('body-parser') //必须在express前面，否则无法解析post
const passport  = require('passport')
const app = express()

//引入users接口
const users = require('./routes/api/users')

//数据库配置
const mongoose = require('mongoose')

//数据库连接
var url = 'mongodb://localhost:27017/user'
mongoose.connect(url,{useNewUrlParser:true}).then(() => console.log('服务器连接成功')).catch(err => console.log(err));


//use body-parser
app.use(bodyParser.urlencoded({extended:false}))   // 必须在路由配置前面，否则无法解析post
app.use(bodyParser.json())

//use passport
app.use(passport.initialize())
require('./config/passport')(passport)

//use routes
app.use('/api/users',users)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`服务器开启在${port}端口`)
})