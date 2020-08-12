//登录注册接口
const express = require("express")
const router = express.Router()
const ShipInfo = require('../../models/ShipInfo')

//测试接口
//route GET  api/ship/test
//返回json数据,public
router.get('/test',(req,res) => {
    res.json({msg:'api works'})
})

// @route  GET api/ship/:mmsi
// @desc   获取单个信息
// @access Privates
router.get(
    '/:index',
    (req, res) => {
      // 按mmsi查询
      if (req.params.index.length === 9) {
        ShipInfo.findOne({ mmsi: req.params.index }).then(ship => {
          if (!ship) {
            return res.status(404).json('请输入正确的mmsi/imo/船舶呼号')
          } 
          res.json(ship)
        })
        .catch(err => res.status(404).json(err))
      }
      // 按imo查询
      else if (req.params.index.length === 7 && typeof (req.params.index * 1) == 'number') {
        ShipInfo.findOne({ imo: req.params.index }).then(ship => {
          if (!ship) {
            return res.status(404).json('请输入正确的mmsi/imo/船舶呼号')
          } 
          res.json(ship)
        })
        .catch(err => res.status(404).json(err))
      }
      // 按callsign查询
      else {
        ShipInfo.findOne({ callsign: req.params.index }).then(ship => {
          if (!ship) {
            return res.status(404).json('请输入正确的mmsi/imo/船舶呼号')
          } 
          res.json(ship)
        })
        .catch(err => res.status(404).json(err))
      }
    }
  )
module.exports = router
