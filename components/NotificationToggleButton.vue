<template>
  <v-btn v-if="isAvailableNotification" icon @click="onClick"><v-icon>{{icon}}</v-icon></v-btn>
</template>

<script>
export default {
  data: function() {
    return {
      isSub: false,
      bellId: this.$route.params.bell || 'bells',
    }
  },
  computed: {
    icon() {
        return this.isSub ? 'mdi-message-bulleted' : 'mdi-message-bulleted-off'
    },
    isAvailableNotification() {
      return "Notification" in window
    },
  },
  methods: {
    async onClick() {
      try {
        if (this.isSub) {
          const res = await this.$confirm('このページの通知をOFFにしますか？')
          if (res) {
            await this.$fcmUnSubscribeBell(this.bellId)
            this.isSub = false
          }
        } else {
          const res = await this.$confirm('このページの通知をONにしますか？')
          if (res) {
            await this.$fcmSubscribeBell(this.bellId)
            this.isSub = true
          }
        }
      } catch (e) {
        this.$toast.error('エラーが発生しました。通知が許可されていません。')
      }
    },
    checkSubscribeState() {
      this.$fcmSubscriptions().then(subscriptions => {
        this.isSub = subscriptions.includes(this.bellId)
        return this.isSub
      })
    },
    watchUid(callback) {
      if (this.$uid) {
        callback && callback()
      } else {
        setTimeout(() => { this.watchUid(callback) }, 10)
      }
    }
  },
  mounted() {
    this.watchUid(this.checkSubscribeState)
  },
}
</script>

<style scoped>
</style>
