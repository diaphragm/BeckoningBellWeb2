<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">場所</th>
          <th class="text-left">備考</th>
          <th class="text-left"><v-icon>mdi-clock</v-icon></th>
          <th class="text-left"><v-icon>mdi-bell-ring</v-icon></th>
          <th class="text-left"><v-icon>mdi-bell-remove</v-icon></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bell in bells" :key="bell.id">
          <td>{{ bell.place }}</td>
          <td>{{ bell.note }}</td>
          <td><time-ago :time="bell.createdAt" />前</td>
          <td><v-btn text nuxt :to="url(bell)">共鳴する</v-btn></td>
          <td>
            <v-btn text v-if="bell.beckoner === $uid" @click="stop(bell.id)">
             空砲を鳴らす
            </v-btn>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
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
