<template>
  <v-container>
    <v-row v-for="message in messages" :key="message.id" :justify="justify(message)">
      <v-col xl=7 lg=7 md=8 sm=9 cols=10 v-if="showMessage(message)">
        <message :message="message" :hunters="hunters" :bell="bell" />
        <div class="text-right caption">
          <time-ago :time="message.createdAt" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TimeAgo from '~/components/TimeAgo.vue'
import Message from '~/components/Message.vue'

export default {
  props: ['messages', 'hunters', 'bell'],
  components: {
    TimeAgo, Message
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
      if (message.hunter === this.$uid) {
        return 'end'
      } else {
        return 'start'
      }
    },

    showMessage(message) {
      if (message.hunter === this.$uid) {
        return true
      } else {
        const hunter = this.hunters.find(h => h.id == message.hunter) || {isBeast: null}
        return !hunter.isBeast
      }
    },
  }
}
</script>
