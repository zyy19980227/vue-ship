//登录注册接口
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../../models/User')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const passport = require('passport')

//测试接口
//route GET  api/users/test
//返回json数据,public
router.get('/test',(req,res) => {
    res.json({msg:'login success'})
})

//注册接口
//route POST  api/users/register
//返回json数据,public
router.post('/register',(req,res) => {
    //查询数据库中是否拥有邮箱
    User.findOne({email:req.body.email})
    .then((user) => {
        if(user) {
            return res.status(400).json({email:'邮箱已被注册！'})
        }else{
            const avatar = gravatar.url(req.body.email,{s:'200',r:'pg',d:'mm'})
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err,hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save().then(user => res.json(user)).catch(err => console.log(err))
                })
            })
        }
    })
})

//登录接口
//route POST  api/users/login
//返回token jwt passport,public
router.post('/login',(req,res) => {
    const email = req.body.email
    const password = req.body.password
    //查询数据库
    User.findOne({email}).then(user => {
        if(!user) {
            return res.status(404).json({email:'用户未注册！'})
        }
        //密码验证
        bcrypt.compare(password,user.password).then(isMatch => {
            if(isMatch){
                const rule = {id:user.id,name:user.name,avatar:user.avatar,email:user.email}
                jwt.sign(rule,'secret',{expiresIn:3600},(err,token) => {
                    if(err) throw err
                    res.json({
                        success:true,
                        token:'Bearer ' + token 
                    })
                })
                //res.json({msg:'success'})
            }else{
                return res.status(400).json({password:'密码错误'})
            }
        })
    })
})

//当前请求信息，验证token接口
//route GET  api/users/current
//返回current user,private
router.get('/current',passport.authenticate('jwt',{session:false}),(req,res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    })
})

module.exports = router