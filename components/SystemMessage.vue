<template>
  <v-card>
    <v-card-text class="ma-1">
      <span v-html="$sanitize(message.body)"></span>
    </v-card-text>
  </v-card>
</template>

<script>
import TimeAgo from '~/components/TimeAgo.vue'

export default {
  props: ['message'],
  components: {
    TimeAgo
  },
  data() {
    return {
    }
  }
}
</script>
