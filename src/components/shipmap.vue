<template>
    <div class="container" id="container">
        <div class="lonlat">
          <div class="item">经度:{{lonlat.lon.toFixed(10)}}，纬度:{{lonlat.lat.toFixed(12)}}</div>
        </div>
        <div class="map" id="map" ref="Mapbox" @contextmenu.prevent="selectLocation()" @mousemove='showLonLat()'></div>
        <div class="card" v-show="showcard">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span @click="locateAreaShip(cardData)">{{formatName(cardData.name)}}</span>
              <img @click="locateAreaShip(cardData)" src="https://cdn.img.wenhairu.com/images/2020/04/01/Fe9fR.png" width='20px' height='20px' class="image">
              <el-button style="float: right; padding: 3px 0" type="text" @click="closecard()">关闭</el-button>
            </div>
            <div class="text item">mmsi：{{cardData.mmsi}}</div>
            <div class="text item">imo：{{formatImo(cardData.imo)}}</div>
            <div class="text item">呼号：{{formatElement(cardData.callsign)}}</div>
            <div class="text item">船舶类型：{{cardData.shiptype}}</div>
            <div class="text item">船长：{{formatWH(cardData.length/10)}}</div>
            <div class="text item">船宽：{{formatWH(cardData.width/10)}}</div>
            <div class="text item">吃水深度：{{formatWH(cardData.draught/1000)}}</div>
            <div class="text item">航行目的地：{{formatElement(cardData.dest)}}</div>
            <div class="text item">预计到港时间：{{formatElement(cardData.eta_std)}}</div>
            <div class="text item">动态信息：{{getState(cardData.navistat)}}</div>
            <div class="text item">经度：{{cardData.lon/1000000}}</div>
            <div class="text item">纬度：{{cardData.lat/1000000}}</div>
            <div class="text item">船首方向：{{cardData.hdg/100}}°</div>
            <div class="text item">航行方向：{{cardData.cog/100}}°</div>
            <div class="text item">转头速率：{{cardData.rot/100}}°</div>
            <div class="text item">航行速度：{{cardData.sog/100}}节</div>
            <div class="text item">上次更新时间：{{format(cardData.lasttime*1000)}}</div>
          </el-card>
        </div>
        <div class="areaA">
          <el-button type="success" plain @click="getinfo()">区域搜索</el-button>
        </div>
        <div class="areaB">
          <el-dropdown size="mini" trigger="click" @command="showCard">
              <el-button type="success" plain :disabled='hasNoAreaData'>显示列表({{this.shipcount}})
                  <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown" class="dropmenu">
                  <el-dropdown-item v-for="(item,id) in areaShipData" :key="id" :command="id">{{item.name}}</el-dropdown-item>
              </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="areaC">
          <el-button type="warning" plain @click="clickclear()">清空列表</el-button>
        </div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
export default {
  name: 'shipmap',
  props: ['shipmsg'],
  data () {
    return {
      // 保存 mapboxgl对象
      mapObject: {},
      url1: 'https://cdn.img.wenhairu.com/images/2020/04/02/FBSMt.png',
      url2: 'https://cdn.img.wenhairu.com/images/2020/04/02/FBI5B.png',
      searchLocation: {
        lon: '',
        lat: ''
      },
      areaShipData: [],
      shipcount: 0,
      cardData: {},
      showcard: false,
      hashighlight: false,
      lonlat: {'lon': 0, 'lat': 0}
    }
  },
  computed: {
    hasNoAreaData () {
      if (this.areaShipData.length === 0) {
        return true
      } else {
        return false
      }
    },
    showLoc () {
      if (this.lonlat.length === 0) {
        return false
      } else {
        return true
      }
    }
  },
  // 页面渲染完成时初始化地图
  mounted () {
    this.mapObject = this.init()
  },
  methods: {
    // 初始化地图函数
    init () {
      // 设置官网申请的授权码
      mapboxgl.accessToken = 'pk.eyJ1Ijoienl5MTk5OCIsImEiOiJjazc1eWFtMzkxMGkzM2VudnBqcXVpaDFnIn0.y_1Qa0PbfashJRs4DmIL2Q'
      // 设置标注为中文
      mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js'
      )
      // 设置地图风格，以及初始化地图中心
      const map = new mapboxgl.Map({
        container: this.$refs.Mapbox,
        style: 'mapbox://styles/mapbox/streets-v9',
        // 设置地图中心为中国香港
        center: [114.1, 22.2],
        // 设置地图比例
        zoom: 8,
        pitchWithRotate: false,
        bearingWithRotate: false,
        dragRotate: false
      })
      // 设置地图导航
      let nav = new mapboxgl.NavigationControl()
      map.addControl(nav, 'top-left')
      // 设置地图语言
      let language = new MapboxLanguage({ defaultLanguage: 'zh' })
      map.addControl(language)
      // 使本地用定位模块
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserLocation: true,
          zoom: 14
        })
      )
      return map
    },
    // 根据获得的经纬度，跳转到坐标
    flyTo () {
      let map = this.mapObject
      map.flyTo({
        center: [this.shipmsg.lon, this.shipmsg.lat],
        zoom: 4,
        speed: 1,
        curve: 1
      })
    },
    // 添加定位图标
    addTrack () {
      let map = this.mapObject
      let url = 'https://cdn.img.wenhairu.com/images/2020/02/28/m5OkB.png'
      // 引入外部图片
      map.loadImage(url, (error, image) => {
        if (error) throw error
        // 先判断是否加载了该id的图片资源，没有则加载
        if (!map.hasImage('track')) {
          map.addImage('track', image)
        }
        map.addLayer({
          id: 'track',
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [this.shipmsg.lon, this.shipmsg.lat]
                }
              }]
            }
          },
          layout: {
            // 使用图片资源
            'icon-image': 'track',
            // 缩放
            'icon-size': 0.15,
            // 旋转角度
            'icon-rotate': this.shipmsg.course * 1,
            // 偏移量
            'icon-offset': [0, -15],
            // 设置图片跟随地图转动，推拉
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        })
      })
    },
    // 移除自定义标记点及其名称
    removeTrack () {
      let map = this.mapObject
      if (map.getLayer('track')) {
        map.removeLayer('track')
        map.removeSource('track')
      }
    },
    showLonLat () {
      let map = this.mapObject
      map.on('mousemove', (e) => {
        this.lonlat = {}
        this.lonlat.lon = e.lngLat.lng
        this.lonlat.lat = e.lngLat.lat
      })
    },
    // 添加选定位置标记
    addLocationMarker () {
      let map = this.mapObject
      map.once('contextmenu', (e) => {
        let el = document.createElement('div')
        el.style.width = '20px'
        el.style.height = '20px'
        el.className = 'location'
        el.id = 'location'
        el.innerHTML = `<img src="https://cdn.img.wenhairu.com/images/2020/04/01/Fe9fR.png" alt="Fe9fR.png" border="0" style='margin:0 auto' width='20px' height='20px'>`
        new mapboxgl.Marker(el).setLngLat([e.lngLat.lng, e.lngLat.lat]).addTo(map)
        this.searchLocation.lon = e.lngLat.lng.toFixed(4)
        this.searchLocation.lat = e.lngLat.lat.toFixed(4)
      })
    },
    // 移除选定位置标记
    removeLocationMarker () {
      let map = this.mapObject
      map.once('contextmenu', (e) => {
        let location = document.getElementById('location')
        location.parentNode.removeChild(location)
      })
    },
    // 选定地图位置坐标
    selectLocation () {
      if (!document.getElementById('location')) {
        this.addLocationMarker()
      } else {
        this.removeLocationMarker()
        this.addLocationMarker()
      }
    },
    getinfo () {
      this.$axios.get('/api/users/current', {headers: {Authorization: localStorage.getItem('Token')}})
      let key = '78e0abf604134752abe26e0aa1785f62'
      let minlon = (this.searchLocation.lon * 1 - 0.05) * 1000000
      let maxlon = (this.searchLocation.lon * 1 + 0.05) * 1000000
      let minlat = (this.searchLocation.lat * 1 - 0.05) * 1000000
      let maxlat = (this.searchLocation.lat * 1 + 0.05) * 1000000
      let hour = 24
      if (this.searchLocation.lon !== '') {
        this.$axios.get(`/area?k=${key}&minlon=${minlon}&maxlon=${maxlon}&minlat=${minlat}&maxlat=${maxlat}&hour=${hour}`, this.LoginInfo).then(res => {
          if (res.data.data) {
            this.areaShipData = this.areaShipData.concat(res.data.data)
            res.data.data.forEach(element => {
              this.addShipLayer(element, this.url1)
            })
          }
          if (res.data.shipcount) {
            this.shipcount = res.data.shipcount * 1 + this.shipcount
          }
        })
      } else {
        this.$message('请在地图上右键标记位置后再进行搜索')
      }
    },
    addShipLayer (e, url) {
      let map = this.mapObject
      // 引入外部图片
      map.loadImage(url, (error, image) => {
        if (error) throw error
        // 先判断是否加载了该id的图片资源，没有则加载
        if (!map.hasImage('ship')) {
          map.addImage('ship', image)
        }
        map.addLayer({
          id: `${e.mmsi}`,
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [e.lon / 1000000, e.lat / 1000000]
                }
              }]
            }
          },
          layout: {
            // 使用图片资源
            'icon-image': 'ship',
            // 缩放
            'icon-size': 0.15,
            // 旋转角度
            'icon-rotate': e.hdg / 100,
            // 偏移量
            'icon-offset': [0, -15],
            // 设置图片跟随地图转动，推拉
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        })
      })
    },
    addHighlightShipLayer (e, url) {
      let map = this.mapObject
      // 引入外部图片
      map.loadImage(url, (error, image) => {
        if (error) throw error
        // 先判断是否加载了该id的图片资源，没有则加载
        if (!map.hasImage('shipHighlight')) {
          map.addImage('shipHighlight', image)
        }
        map.addLayer({
          id: 'highlight',
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [e.lon / 1000000, e.lat / 1000000]
                }
              }]
            }
          },
          layout: {
            // 使用图片资源
            'icon-image': 'shipHighlight',
            // 缩放
            'icon-size': 0.25,
            // 旋转角度
            'icon-rotate': e.hdg / 100,
            // 偏移量
            'icon-offset': [0, -15],
            // 设置图片跟随地图转动，推拉
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        })
      })
    },
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
    getState (num) {
      if (num === 0) return '动力航行中'
      if (num === 1) return '锚泊'
      if (num === 2) return '未受令'
      if (num === 3) return '机动性受限'
      if (num === 4) return '受吃水限制'
      if (num === 5) return '锚链系泊'
      if (num === 6) return '搁浅'
      if (num === 7) return '捕捞中'
      if (num === 8) return '风帆动力航行'
      if (num >= 9 && num <= 15) return '为未来保留'
    },
    locateAreaShip (e) {
      let map = this.mapObject
      map.flyTo({
        center: [e.lon / 1000000, e.lat / 1000000],
        zoom: 10,
        speed: 1,
        curve: 1
      })
    },
    showCard (command) {
      let map = this.mapObject
      if (map.getLayer('highlight')) {
        map.removeLayer('highlight')
        map.removeSource('highlight')
      }
      this.cardData = this.areaShipData[command]
      this.showcard = true
      this.locateAreaShip(this.cardData)
      this.addHighlightShipLayer(this.cardData, this.url2)
    },
    closecard () {
      this.showcard = false
    },
    clearShipList () {
      let map = this.mapObject
      this.areaShipData.forEach(element => {
        if (map.getLayer(`${element.mmsi}`)) {
          map.removeLayer(`${element.mmsi}`)
          map.removeSource(`${element.mmsi}`)
        }
      })
      if (map.getLayer('highlight')) {
        map.removeLayer('highlight')
        map.removeSource('highlight')
      }
      this.closecard()
      this.areaShipData = []
      this.shipcount = 0
      this.cardData = {}
      this.hashighlight = false
    },
    clickclear () {
      this.$confirm('是否清空当前船舶列表?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clearShipList()
        this.$message({
          type: 'success',
          message: '清空成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    formatImo (e) {
      if (e === 0) {
        return '暂无数据'
      } else {
        return e
      }
    },
    formatElement (e) {
      if (!e) {
        return '暂无数据'
      } else {
        return e
      }
    },
    formatName (name) {
      if (!name) {
        return '该船舶暂无名称'
      } else {
        return name
      }
    },
    formatWH (e) {
      if (e === 0) {
        return '暂无数据'
      } else {
        return `${e}m`
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
    position relative
    top 0
    height 100%
    width 100%
    .lonlat
      position absolute
      z-index 1000
      bottom 5px
      left 5px
      padding 0
        .item
          padding 0
          width 400px
    .card
      position absolute
      top 90px
      left 50px
      .box-card
        position relative
        width 480px
        background-color rgb(240,249,235)
        .clearfix
          margin-left 20px
          cursor pointer
        .image
          position absolute
          top 16px
          left 12px
      .text
        font-size 14px
      .item
        margin-bottom 10px
    .map
        height 100%
        width 100%
    .areaA
      position absolute
      top 100px
      right 10px
    .areaB
      position absolute
      top 150px
      right 10px
      .dropmenu
        height 600px
    .areaC
      position absolute
      top 200px
      right 10px
</style>
