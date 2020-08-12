<template>
    <div class="login">
        <div class="logo">
            <img src="../assets/pic/logo.png" width="370px" height="67px">
        </div>
        <section class="container">
            <div class="formWrapper">
                <span class="title">在线船舶定位查询系统</span>
                <el-form :model="LoginInfo" :rules="rules" ref="loginForm" label-width="100px" class="form">
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="LoginInfo.email" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="LoginInfo.password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" class="submit" @click="login('loginForm')">登录</el-button>
                    </el-form-item>
                    <div class="area">
                        <p>还没有账号？现在<router-link to='/register'>注册</router-link></p>
                    </div>
                </el-form>
            </div>
        </section>
    </div>
</template>

<script>
import jwtDecode from 'jwt-decode' // 解析token
export default {
  name: 'login',
  components: {},
  data () {
    return {
      LoginInfo: {
        email: '',
        password: ''
      },
      rules: {
        email: [
          {
            type: 'email',
            required: true,
            message: '邮箱格式不正确',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '密码不能为空',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 30,
            message: '长度在 6 到 30 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    login (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/api/users/login', this.LoginInfo).then(res => {
            // token
            // console.log(res)
            const { token } = res.data
            // 存储到localstorage
            localStorage.setItem('Token', token)
            // 解析token
            const decoded = jwtDecode(token)
            // console.log(decoded)
            // 将token存储到vuex中
            this.$store.dispatch('setAuthenticated', !this.isEmpty(decoded))
            this.$store.dispatch('setUser', decoded)
            // 跳转页面
            this.$router.push('/index')
            this.$router.go(0)
          })
        }
      })
    },
    isEmpty (value) {
      return (
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0)
      )
    }
  }
}
</script>

<style lang="stylus" scoped>
.login
    position relative
    width 100%
    height 100%
    background url(../assets/pic/bg.jpg) no-repeat center center
    background-size 100% 100%
    .logo
        position absolute
        top 10px
        left 10px
    .container
        width 380px
        height 100%
        position absolute
        top 15%
        right 5%
        padding 25px
        border-radius 8px
        text-align center
        .formWrapper
            font-family '幼圆'
            .title
                font-weight bold
                font-size 26px
                color black
                padding-bottom 10px
            .form
                margin-top 25px
                font-weight bold
                background-color #fff
                padding 20px 40px 20px 20px
                border-radius 5px
                box-shadow 0px 5px 10px #cccc
                opacity 0.9
                .submit
                    width 100%
                .area
                    text-align right
                    font-size 12px
                    color #333
</style>
