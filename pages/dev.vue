<template>
  <div>
    {{ token }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: ''
    }
  },
  created() {
    this.$fireMess.onTokenRefresh(() => {
      this.getFcmToken
    })
    this.getFcmToken()
  },

  methods: {
    getFcmToken() {
      this.$fireMess.getToken().then(token => {
        this.token = token
      })
    }
  }
}
</script>
