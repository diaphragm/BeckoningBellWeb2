<template>
  <v-container>
    <v-row v-for="message in messages" :justify="justify(message)" :key="message.id">

      <v-col v-if="message.type === 'system'" cols=8>
        <v-row>
          <v-col class="py-0">
            <system-message :message="message" />
          </v-col>
        </v-row>
        <v-row justify="end">
          <v-col cols=1 class="pa-0">
            <span class="caption"><time-ago :time="message.createdAt" /></span>
          </v-col>
        </v-row>
      </v-col>

      <v-col v-else xl=8 lg=8 md=9 sm=10 cols=11 class="pa-1">
        <v-row>
          <v-col class="py-0">
            <message :message="message" />
          </v-col>
        </v-row>
        <v-row justify="end">
          <v-col cols=1 class="pa-0">
            <span class="caption"><time-ago :time="message.createdAt" /></span>
          </v-col>
        </v-row>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
import TimeAgo from '~/components/TimeAgo.vue'
import Message from '~/components/Message.vue'
import SystemMessage from '~/components/SystemMessage.vue'

export default {
  props: ['messages', 'user'],
  components: {
    TimeAgo, Message, SystemMessage
  },
  data() {
    return {
    }
  },
  methods: {
    generateColorCode(id) {
      const buffer = (new TextEncoder).encode(id)
      const hue = buffer[0] * buffer[1]
      return `hsl(${hue}, 100%, 34%)`
    },

    justify(message) {
      if (message.type === 'system') {
        return 'center'
      }
      // is own?
      if (message.hunter.id === this.$uid) {
        return 'end'
      } else {
        return 'start'
      }
    },

  }
}
</script>

<style scoped>
  .hunter-icon .v-image__image {
    filter: brightness(0) invert(0);
  }
</style>
