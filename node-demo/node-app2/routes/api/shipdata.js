const mongoose = require('mongoose')
const Schema = mongoose.Schema
const express = require("express")
const router = express.Router()

//create schema
const ShipDataSchema = new Schema({
    mmsi:{
        type:String,
        required: true
    },
    Bj_time:{
        type:String,
        required: true
    },
    lon:{
        type:String,
        required: true
    },
    lat:{
        type:String,
        required: true
    },
    course:{
        type:String,
        required: true
    },
    speed:{
        type:String,
        required: true
    }
})
// 将时间戳转化为指定格式日期
let add0 = m => { return m<10?'0'+m:m }
let format = timestamp => {
    let time = new Date(timestamp)
    let y = time.getFullYear()
    let m = time.getMonth()+1
    let d = time.getDate()
    let h = time.getHours()
    let mm = time.getMinutes()
    let s = time.getSeconds()
    return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s)
}
// @route  GET api/shipdata/:time/:mmsi
// @desc   获取单个信息
// @access Private
router.get(
    '/:time/:mmsi',
    (req, res) => {
        // 查找距离输入时间最近的过去的一条数据
        date = format((req.params.time)*1)
        mongoose.model('shipdata',ShipDataSchema,`${req.params.mmsi}`).find({"Bj_time":{$lte:date}}).sort({'Bj_time':-1}).limit(1)
        .then(ship => {
          if (!ship) {
            return res.status(404).json('请输入正确的mmsi/imo/船舶呼号');
          }
          res.json(ship)
        })
        .catch(err => res.status(404).json(err));
    }
  )
module.exports = router