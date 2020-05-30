<template>
  <v-row align="end">
    <v-col cols=11>
      <v-card>
        <v-row align="center">
          <v-col xl=3 lg=3 md=3 sm=4 cols=5 justify="center" >
            <v-img src="caryll/hunter.svg" height="32" contain/>
            <v-card-subtitle class="pa-1 ma-1 text-center">
              {{ message.hunter.name }}
            </v-card-subtitle>
          </v-col>
          <v-col xl=9 lg=9 md=9 sm=8 cols=7 justify="start">
            <v-card-text v-if="message.type == 'text'" class="pa-1 ma-1">
              {{ message.body }}
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
    </v-col>
    <v-col cols=1 class="pa-0">
      <span class="caption"><time-ago :time="message.createdAt"/></span>
    </v-col>
  </v-row>
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

<style scoped>
  .hunter-icon .v-image__image {
    filter: brightness(0) invert(0);
  }
</style>
