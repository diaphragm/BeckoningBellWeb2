<template>
  <span>{{timeAgo}}</span>
</template>

<script>
export default {
  props: ['time'],
  data() {
    return {
      timeAgo: ''
    }
  },
  computed: {
    milliseconds() {
      const seconds = this.time.seconds
      const nanoseconds = this.time.nanoseconds
      return Math.floor(seconds * 1000 + nanoseconds / 1000000)
    }
  },
  created() {
    this.calcTimeAgo()
    setInterval(this.calcTimeAgo, 1000)
  },
  methods: {
    calcTimeAgo() {
      if (!this.time) {
        this.timeAgo = '-'
        return
      }

      let now = new Date()
      let date = new Date(this.milliseconds)
      let diff = new Date(Math.max(now.getTime() - date.getTime(), 0))

      if (diff.getUTCFullYear() - 1970) {
        this.timeAgo = diff.getUTCFullYear() - 1970 + '年'
      } else if (diff.getUTCMonth()) {
        this.timeAgo = diff.getUTCMonth() + '月'
      } else if (diff.getUTCDate() - 1) {
        this.timeAgo = diff.getUTCDate() - 1 + '日'
      } else if (diff.getUTCHours()) {
        this.timeAgo = diff.getUTCHours() + '時間'
      } else if (diff.getUTCMinutes()) {
        this.timeAgo = diff.getUTCMinutes() + '分'
      } else {
        if (diff.getUTCSeconds() >= 20) {
          this.timeAgo = Math.floor(diff.getUTCSeconds() / 10)*10 + '秒'
        } else {
          this.timeAgo = 'たった今'
        }
      }
    }
  }
}
</script>
