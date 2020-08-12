<template>
    <div class="register">
        <div class="logo">
            <img src="../assets/pic/logo.png" width="370px" height="67px">
        </div>
        <section class="container">
            <div class="formWrapper">
                <span class="title">在线船舶定位查询系统</span>
                <el-form :model="UserInfo" :rules="rules" ref="registerForm" label-width="100px" class="form">
                    <el-form-item label="用户名" prop="name">
                        <el-input v-model="UserInfo.name" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="UserInfo.email" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="UserInfo.password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="password2">
                        <el-input type="password" v-model="UserInfo.password2" placeholder="请确认密码"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" class="submit" @click="register('registerForm')">注册</el-button>
                    </el-form-item>
                    <div class="area">
                        <p>已有账号？现在<router-link to='/login'>登录</router-link></p>
                    </div>
                </el-form>
            </div>
        </section>
    </div>
</template>

<script>
export default {
  name: 'register',
  components: {},
  data () {
    var validatePass = (rule, value, callback) => {
      if (value !== this.UserInfo.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      UserInfo: {
        name: '',
        email: '',
        password: '',
        password2: ''
      },
      rules: {
        name: [
          {
            required: true,
            message: '用户名不能为空',
            trigger: 'change'
          },
          {
            min: 2,
            max: 15,
            message: '长度在 2 到 15 个字符',
            trigger: 'blur'
          }
        ],
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
        ],
        password2: [
          {
            required: true,
            message: '确认密码不能为空',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 30,
            message: '长度在 6 到 30 个字符',
            trigger: 'blur'
          },
          {
            validator: validatePass,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    register (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/api/users/register', this.UserInfo).then(res => {
            // 注册成功
            this.$message({
              message: '注册成功!',
              type: 'success'
            })
          })
          this.$router.push('/login')
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.register
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
