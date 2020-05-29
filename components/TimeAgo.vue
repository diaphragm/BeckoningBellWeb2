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
  created() {
    this.calcTimeAgo()
    setInterval(this.calcTimeAgo, 5*1000)
  },
  methods: {
    calcTimeAgo() {
      if (!this.time) {
        this.timeAgo = '-'
        return
      }

      let now = new Date()
      let date = new Date(this.time.toMillis())
      let diff = new Date(Math.max(now.getTime() - date.getTime(), 0))

      if (diff.getUTCFullYear() - 1970) {
        this.timeAgo = diff.getUTCFullYear() - 1970 + 'y'
      } else if (diff.getUTCMonth()) {
        this.timeAgo = diff.getUTCMonth() + 'mom'
      } else if (diff.getUTCDate() - 1) {
        this.timeAgo = diff.getUTCDate() - 1 + 'd'
      } else if (diff.getUTCHours()) {
        this.timeAgo = diff.getUTCHours() + 'h'
      } else if (diff.getUTCMinutes()) {
        this.timeAgo = diff.getUTCMinutes() + 'm'
      } else {
        if (diff.getUTCSeconds() >= 20) {
          this.timeAgo = Math.floor(diff.getUTCSeconds() / 10)*10 + 's'
        } else {
          this.timeAgo = 'now'
        }
      }
    }
  }
}
</script>
