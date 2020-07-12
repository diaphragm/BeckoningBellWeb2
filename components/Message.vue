<template>
  <v-card>
    <v-row align="center">
      <v-col xl=3 lg=3 md=3 sm=4 cols=5 justify="center" >
        <v-img :src="`caryll/${hunter.caryll}`" height="32" contain />

        <v-card-subtitle class="pa-1 ma-1 text-center">
          {{ hunter.name }}
        </v-card-subtitle>
      </v-col>
      <v-col xl=9 lg=9 md=9 sm=8 cols=7 justify="start">
        <v-card-text v-if="message.type == 'text'" class="pa-1 ma-1">
          <span v-html="$sanitize(message.body)"></span>
        </v-card-text>
        <v-img v-if="message.type == 'stamp'" class="pa-1 ma-1"
          :src="`stamps/${message.body}`"
          height="100"
          contain
          position="left"
        />
        <v-spacer />
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import TimeAgo from '~/components/TimeAgo.vue'

export default {
  props: ['message', 'hunters'],
  components: {
    TimeAgo
  },
  data() {
    return {
    }
  },
  computed: {
    hunter() {
      return this.hunters.find(h => h.id == this.message.hunter) || {name: null, caryll: null}
    }
  },
  methods: {
    generateColorCode(id) {
      const buffer = (new TextEncoder).encode(id)
      const hue = buffer[0] * buffer[1]
      return `hsl(${hue}, 100%, 34%)`
    }
  }
}
</script>

<style scoped>
  .hunter-icon .v-image__image {
    filter: brightness(0) invert(0);
  }
</style>
