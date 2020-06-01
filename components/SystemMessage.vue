<template>
  <v-card>
    <v-card-text class="ma-1">
      {{ message.body }}
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
