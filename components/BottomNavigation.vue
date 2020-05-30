<template>
  <v-bottom-navigation fixed app grow id="bottom-navigation">

    <template v-for="(messages, group, i) in messageList">
      <v-menu top :offset-y="true" :key="i">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on">
            <span>{{ group }}</span>
            <v-icon>{{ icon(group) }}</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="message in messages" @click="dev(message)" :key="message">
            <v-list-item-title>{{ message }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-for="(stamps, group, i) in stampList">
      <v-menu top :offset-y="true" :key="i">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on">
            <span>{{ group }}</span>
            <v-icon>{{ icon(group) }}</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-container>
            <v-row>
              <v-col v-for="(stamp, i) in stamps">
                <v-btn height="80" width="80">
                  <img :src="`stamps/${stamp}`" height="80" width="80"/>
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
      stampList: StampList
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
    dev(arg) {
      console.log(arg)
    }
  }
}
</script>

<style scoped>
  #bottom-navigation {
    overflow-x: auto;
  }
</style>
