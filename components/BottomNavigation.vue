<template>
  <v-bottom-navigation fixed app grow id="bottom-navigation"
    class="justify-start justify-md-center justify-lg-center justify-xl-center">

    <template v-for="(messages, group) in messageList">
      <v-menu top :offset-y="true" :key="group">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on">
            <span>{{ group }}</span>
            <v-icon>{{ icon(group) }}</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="message in messages" @click="click(message, 'text')" :key="message">
            <v-list-item-title>{{ message }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-for="(stamps, group) in stampList">
      <v-menu top :offset-y="true" :key="group">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on">
            <span>{{ group }}</span>
            <v-icon>{{ icon(group) }}</v-icon>
          </v-btn>
        </template>
        <v-card class="stamp-list">
          <v-container>
            <v-row>
              <v-col v-for="(stamp) in stamps" :key="stamp" class="text-center pa-1">
                <v-btn height="80" width="80" @click="click(stamp, 'stamp')">
                  <img :src="`stamps/${stamp}`" height="80" width="80" />
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-menu>
    </template>

  </v-bottom-navigation>
</template>

<script>
import { MessageList, StampList } from '~/plugins/BloodborneUtils.js'
import TimeAgo from '~/components/TimeAgo.vue'

export default {
  props: [''],
  components: {
  },
  data() {
    return {
      messageList: MessageList,
      stampList: StampList,
    }
  },
  methods: {
    icon(group) {
      return {
        '返答/挨拶': 'mdi-human-greeting',
        'ホスト向け': 'mdi-account-voice',
        '合流': 'mdi-map-marker',
        '戦略': 'mdi-strategy',
        'ヒント/その他': 'mdi-chat-alert',
        'スタンプ': 'mdi-shape',
      }[group]
    },
    click(body, type) {
      console.log(this.$vuetify.breakpoint.name)
      this.selected = 30
      this.$emit('click', {type, body})
    }
  }
}
</script>

<style scoped>
  #bottom-navigation {
    overflow-x: auto;
  }
  .v-list {
    max-height: 90vh;
    max-width: 90vw;
    overflow-y: auto;
  }
  .stamp-list {
    max-height: 90vh;
    max-width: 90vw;
    overflow-y: auto;
  }
</style>
