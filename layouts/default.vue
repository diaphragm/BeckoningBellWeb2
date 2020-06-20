<template>
  <v-app id="app">
    <nuxt />
  </v-app>
</template>

<script>
// import Vue from 'vue'

export default {
  name: 'Default',
  data () {
    return {
    }
  },
  beforeCreate() {
    // pluginだと$fireAuthがundefinedなのでLayoutで設定
    this.$fireAuth.onAuthStateChanged((user) => {
      this.__proto__.__proto__.$auth = user
      this.__proto__.__proto__.$uid = user.uid
    })
    this.$fireAuth.signInAnonymously().catch((e) => {
      console.error(e.code, e.message)
    })
  }
}
</script>
