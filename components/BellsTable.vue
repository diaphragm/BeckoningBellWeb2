<template>
  <v-container>
    <v-row>
      <v-col cols=12 sm=6 md=6 xl=4 v-for="bell in bells" :key="bell.id">
        <v-card elevation=3 class="pa-2">
          <v-card-title>
            <nuxt-link :to="bell.id">{{ bell.place }}</nuxt-link>
          </v-card-title>
          <v-card-subtitle class="text-right">
            {{ bell.region }} /
            <time-ago :time="bell.createdAt" />前
          </v-card-subtitle>
          <v-card-text>
            <span v-html="$htmlize(bell.note)"></span>
          </v-card-text>
          <v-card-actions v-if="bell.beckoner === $uid" class="d-flex justify-center">
            <v-btn outlined color="error" @click="stop(bell.id)">空砲を鳴らす</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TimeAgo from '~/components/TimeAgo.vue'

export default {
  props: ['bells'],
  components: {
    TimeAgo
  },
  methods: {
    url(bell) {
      return `/${bell.id}`
    },

    stop(bellId) {
      this.$confirm('募集を終了しますか？').then(res => {
        if (!res) { return }

        this.$silenceBell(bellId).then(() => {
          this.$toast.info('募集を終了しました。')
        })
      })
    }
  }
}
</script>
