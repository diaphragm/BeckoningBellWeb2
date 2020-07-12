<template>
  <v-btn @click="stop" color="error" outlined>
    空砲を鳴らす
  </v-btn>
</template>

<script>
export default {
  props: ['bell'],
  data() {
    return {
    }
  },
  methods: {
    stop() {
      this.$confirm('募集を終了しますか？').then((res) => {
        if (!res) { return }

        this.$silenceBell(this.bell.id).then(() => {
          this.$toast.success('募集を終了しました。')
        }).catch((error) => {
          console.log(error)
          this.$toast.error('エラーが発生しました。')
        })
      })
    }
  }
}
</script>
