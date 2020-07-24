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

  async beforeCreate() {
    // pluginだと$fireAuthがundefinedなのでLayoutで設定
    this.__proto__.__proto__.$uid = null
    await this.$fireAuth.onAuthStateChanged((user) => {
      if (user) this.__proto__.__proto__.$uid = user.uid
    })
    await this.$fireAuth.signInAnonymously()

    this.$fireMess.onTokenRefresh(() => {
      this.$fcmSyncToken()
    })
  }
}
</script>
