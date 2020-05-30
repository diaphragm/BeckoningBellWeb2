<template>
  <v-card>
    <v-card-text>
      {{ message.body }}
    </v-card-text>
    <v-card-text>
      {{ message.hunter.name }}
    </v-card-text>
    <v-card-text>
      <time-ago :time="message.createdAt"/>
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
  },
}
</script>
