<template>
  <div class="container">
    <div class="menuwrapper">
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="2" @click="shipdrawer = true" :disabled='!hasship'>船舶信息</el-menu-item>
        <el-menu-item index="3" @click="userdrawer = true">个人中心</el-menu-item>
        <div class="searchcontainer">
          <el-input v-model="input" placeholder="请输入mmsi/imo/呼号" class="input"></el-input>
          <el-date-picker v-model="time" type="datetime" placeholder="选择日期时间" align="right" :picker-options="pickerOptions" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
          <el-button type="primary" icon="el-icon-search" @click="GetShip()">搜索</el-button>
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">搜索历史<i class="el-icon-arrow-down el-icon--right"></i></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-circle-check" v-for="(item,id) of this.historyArr" :key="id" :command='id'>◆船名:{{item.name}} ◆mmsi:{{item.mmsi}} ◆时间:{{item.time}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-menu>
      <div class="line"></div>
    </div>
    <el-drawer :visible.sync="userdrawer" direction="ltr" size='300px' custom-class='userdrawer'>
      <div class="avatarwarapper">
        <img :src='usermsg.avatar' class="avatar">
      </div>
      <div class="usermsg">
        <p class="welcome">欢迎,  {{usermsg.name}}</p>
        <p class="tag">邮箱:</p>
        <p class="email">{{usermsg.email}}</p>
      </div>
      <div class="exit" @click="logout()">
        <span class="el-icon-monitor">退出登录</span>
      </div>
    </el-drawer>
    <el-drawer :visible.sync="shipdrawer" direction="ltr" size='300px' custom-class='shipdrawer'>
      <p class="shipname">{{shipdata.name}}</p>
      <el-collapse class="shipmsg">
        <el-collapse-item title="◆船舶档案" name="1">
          <div>◇mmsi：{{shipdata.mmsi}}</div>
          <div>◇imo：{{shipdata.imo}}</div>
          <div>◇呼号(callsign)：{{shipdata.callsign}}</div>
          <div>◇类型(shiptype)：{{shipdata.shiptype}}</div>
          <div>◇船长(length)：{{shipdata.length}}米</div>
          <div>◇船宽(width)：{{shipdata.width}}米</div>
          <div>◇吃水(drought)：{{shipdata.drought}}米</div>
        </el-collapse-item>
        <el-collapse-item title="◆地理信息" name="2">
          <div>◇上次更新：{{shipmsg.Bj_time}}</div>
          <div>◇经度(lon)：{{shipmsg.lon}}</div>
          <div>◇纬度(lat)：{{shipmsg.lat}}</div>
          <div>◇航向(course)：{{shipmsg.course}}°</div>
          <div>◇航速(speed)：{{shipmsg.speed}}节</div>
        </el-collapse-item>
      </el-collapse>
    </el-drawer>
    <shipmap :shipmsg='shipmsg' ref='map'></shipmap>
  </div>
</template>

<script>
import shipmap from '../components/shipmap'
export default {
  name: 'index',
  components: {
    shipmap
  },
  data () {
    return {
      activeIndex: '1',
      input: '',
      historyArr: [],
      userdrawer: false,
      shipdrawer: false,
      time: '',
      shipdata: {
        mmsi: {type: Number, default: ''},
        imo: {type: Number, default: ''},
        shiptype: {type: String, default: ''},
        name: {type: String, default: ''},
        callsign: {type: String, default: ''},
        length: {type: Number, default: ''},
        width: {type: Number, default: ''},
        drought: {type: Number, default: ''}
      },
      shipmsg: {
        Bj_time: {type: String, default: ''},
        lon: {type: Number, default: ''},
        lat: {type: Number, default: ''},
        course: {type: Number, default: ''},
        speed: {type: Number, default: ''}
      },
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  computed: {
    // 获取用户信息
    usermsg () {
      return this.$store.getters.user
    },
    // 判断当前是否进行了查询
    hasship () {
      if (typeof (this.shipdata.mmsi) !== 'object') {
        return true
      } else {
        return false
      }
    },
    // 根据当前输入的时间计算时间戳
    timestamp () {
      return new Date(`${this.time}`).getTime()
    }
  },
  methods: {
    // 向后端发起请求获取船舶信息
    GetShip () {
      this.$axios.get('/api/users/current', {headers: {Authorization: localStorage.getItem('Token')}})
      // 当前输入时间不为空是发起请求
      if (this.time !== '' && this.timestamp > 1503158400000 && this.input !== '') {
        this.$axios.get(`/shipapi/ship/${this.input}`).then(res => {
          this.shipdata.mmsi = res.data.mmsi
          this.shipdata.imo = res.data.imo
          this.shipdata.name = res.data.name
          this.shipdata.callsign = res.data.callsign
          this.shipdata.shiptype = res.data.shiptype
          this.shipdata.length = res.data.length
          this.shipdata.width = res.data.width
          this.shipdata.drought = res.data.drought
          this.$axios.get(`/shipapi/shipdata/${this.timestamp}/${this.shipdata.mmsi}`).then(res => {
            this.shipmsg.Bj_time = res.data[0].Bj_time
            this.shipmsg.lon = this.getnum(res.data[0].lon)
            this.shipmsg.lat = this.getnum(res.data[0].lat)
            this.shipmsg.course = res.data[0].course
            this.shipmsg.speed = res.data[0]['speed\r']
            this.markerAddRemoveToggle()
            this.setLocalstorage(this.timestamp, this.shipdata.mmsi, this.shipdata.name)
            this.getLocalstorage()
          })
        })
      } else if (this.time === '' || this.input === '') {
        // 未输入时间时提醒用户输入时间
        this.$alert('请输入搜索索引或时间!', {
          confirmButtonText: '确定'
        })
      } else {
        this.$alert('请输入北京时间[2017-08-20 00:00:00]之后的时间！', {
          confirmButtonText: '确定'
        })
      }
    },
    // 搜索历史函数
    handleCommand (command) {
      this.time = new Date(this.historyArr[command].timestamp)
      this.input = this.historyArr[command].mmsi
      this.GetShip()
      this.removeLocalstorage(command)
      this.getLocalstorage()
    },
    // 退出登录函数
    logout () {
      this.$confirm('是否退出登录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '退出登录成功'
        })
        // 清除token
        localStorage.removeItem('Token')
        // 设置vuex
        this.$store.dispatch('clearCurrentState')
        // 跳转路由到登录页面
        this.$router.push('/login')
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消退出登录'
        })
      })
    },
    // 取经纬度小数点后六位
    getnum (num) {
      return (num * 1).toFixed(6)
    },
    // 定位函数
    markerAddRemoveToggle () {
      this.$refs.map.removeTrack()
      this.$refs.map.addTrack()
      this.$refs.map.flyTo()
    },
    // 格式化时间函数
    add0 (m) {
      return m < 10 ? '0' + m : m
    },
    format (timestamp) {
      let time = new Date(timestamp)
      let y = time.getFullYear()
      let m = time.getMonth() + 1
      let d = time.getDate()
      let h = time.getHours()
      let mm = time.getMinutes()
      let s = time.getSeconds()
      return y + '-' + this.add0(m) + '-' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s)
    },
    // 将搜索信息存储到localstorage
    setLocalstorage (timestamp, mmsi, name) {
      let formatTime = this.format(timestamp)
      let object = { mmsi: mmsi, time: formatTime, timestamp: timestamp, name: name }
      // 当不存在localstorage时
      if (localStorage.getItem(`${this.usermsg.name}SearchHistory`) === null) {
        let arrayObject = []
        arrayObject.push(object)
        localStorage.setItem(`${this.usermsg.name}SearchHistory`, JSON.stringify(arrayObject))
      } else {
        let arrayObjectLocal = JSON.parse(localStorage.getItem(`${this.usermsg.name}SearchHistory`))
        if (arrayObjectLocal.length < 10) {
          arrayObjectLocal.push(object)
          localStorage.setItem(`${this.usermsg.name}SearchHistory`, JSON.stringify(arrayObjectLocal))
        } else {
          arrayObjectLocal.splice(0, 1)
          arrayObjectLocal.push(object)
          localStorage.setItem(`${this.usermsg.name}SearchHistory`, JSON.stringify(arrayObjectLocal))
        }
      }
    },
    // 获取localstorage里的历史搜索记录，并赋值给historyArr数列
    getLocalstorage () {
      let arr = JSON.parse(localStorage.getItem(`${this.usermsg.name}SearchHistory`))
      if (arr !== null) {
        this.historyArr = arr.reverse()
      }
    },
    // 搜索历史记录时清除localstorage里新增的记录
    removeLocalstorage (index) {
      let arr = JSON.parse(localStorage.getItem(`${this.usermsg.name}SearchHistory`))
      if (arr !== null) {
        let newarr = arr.reverse()
        newarr.splice(index, 1)
        newarr.reverse()
        localStorage.setItem(`${this.usermsg.name}SearchHistory`, JSON.stringify(newarr))
      }
    }
  },
  // 页面渲染完成后获取历史搜索记录
  mounted () {
    this.getLocalstorage()
  }
}
</script>

<style lang="stylus" scoped>
.container
  position relative
  width 100%
  height 100%
  .menuwrapper
    position absolute
    width 850px
    left 0
    right 0
    margin-left auto
    margin-right auto
    z-index 2000
    .demo-basic--circle
      width 40px
    .el-menu-demo
      padding-left 20px
      .input
        width 200px
      .searchcontainer
        margin-top 10px
        padding-left 20px
        .el-dropdown
          padding-left 10px
  .userdrawer
    .avatarwarapper
      width 80px
      height 80px
      margin 0 auto
      margin-top 70px
      .avatar
        width 100%
        height 100%
        border-radius 50%
    .usermsg
      width 300px
      font-size 25px
      margin 0 auto
      margin-top 60px
      .welcome,.email,.tag
        text-align center
        margin-top 25px
    .exit
      color yellow
      font-size 20px
      text-align center
      margin-top 280px
      .el-icon-monitor
        cursor pointer
  .shipdrawer
    font-size 10px
    .shipname
      padding-bottom 10px
      text-align center
      font-size 20px
    .shipmsg
      opacity 0.8
</style>
