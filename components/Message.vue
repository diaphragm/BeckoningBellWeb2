<template>
  <v-card class="d-flex align-center" :class="{ beckoner: bell.beckoner == message.hunter}">
    <v-card flat class="text-center px-0 px-sm-2 py-0" v-if="message.type !== 'system'" dense>
      <v-avatar tile>
        <v-img :src="`caryll/${hunter.caryll}`" height="32" contain />
      </v-avatar>
      <v-card-subtitle class="px-2 py-1">
        {{ hunter.name }}
      </v-card-subtitle>
    </v-card>
    <v-card flat>
      <v-card-text v-if="message.type === 'stamp'">
        <v-img class="pa-1 ma-1"
          :src="`stamps/${message.body}`"
          height="100"
          width="150"
          contain
          position="left"
        />
      </v-card-text>
      <v-card-text v-else>
        <span v-if="message.type === 'system'" v-html="$sanitize(message.body)"></span>
        <span v-else v-html="$htmlize(message.body)"></span>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script>
import TimeAgo from '~/components/TimeAgo.vue'

export default {
  props: ['message', 'hunters', 'bell'],
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

<style lang="scss" scoped>
  .beckoner {
    border: 1px #b9966e solid;
  }
  .hunter-icon .v-image__image {
    filter: brightness(0) invert(0);
  }
</style>
