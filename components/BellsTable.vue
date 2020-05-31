<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">場所</th>
          <th class="text-left">備考</th>
          <th class="text-left">🔔</th>
          <th class="text-left">🕓</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bell in bells" :key="bell.id">
          <td>{{ bell.place }}</td>
          <td>{{ bell.note }}</td>
          <td><nuxt-link :to="url(bell)">共鳴する</nuxt-link></td>
          <td><time-ago :time="bell.createdAt"/></td>
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
    timeAgo(bell) {

    }
  }
}
</script>
