<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode' // 解析token
export default {
  name: 'App',
  created () {
    if (localStorage.Token) {
      const decoded = jwtDecode(localStorage.Token)
      // 将token存储到vuex中
      this.$store.dispatch('setAuthenticated', !this.isEmpty(decoded))
      this.$store.dispatch('setUser', decoded)
    }
  },
  methods: {
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
#app
  width 100%
  height 100%
</style>
