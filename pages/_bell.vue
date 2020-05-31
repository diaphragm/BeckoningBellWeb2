<template>
  <v-app id="app">

    <v-content>
      <app-bar :bell="bell" :user="user" />

      <v-container class="main-container">
        <v-row justify="center">
          <v-col cols=12>
            <template v-for="message in messages">
              <v-row :key="message.id" :justify="own(message) ? 'end' : 'start'">
                <v-col xl=8 lg=8 md=9 sm=10 cols=11 class="pa-1">
                  <message :message="message"/>
                </v-col>
              </v-row>
            </template>
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <bottom-navigation @click="sendMessage"/>

    <v-snackbar v-model="snackbar.open" :color="snackbar.color" :timeout="2000">
      {{ snackbar.message }}
    </v-snackbar>

    <ScrollButton />

  </v-app>
</template>

<script>
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
Vue.use(firestorePlugin)
import { BeckonerName, BeckonerCaryll, CaryllRuneList, FirstNameList, LastNameList} from '~/plugins/BloodborneUtils.js'
import TimeAgo from '~/components/TimeAgo.vue'
import Message from '~/components/Message.vue'
import AppBar from '~/components/AppBar.vue'
import BottomNavigation from '~/components/BottomNavigation.vue'
import ScrollButton from '~/components/ScrollButton.vue'

export default {
  layout: 'bell',

  components: {
    TimeAgo, Message, AppBar, BottomNavigation, ScrollButton
  },

  data() {
    return {
      bellObj: null,
      bell: {},
      messages: [],
      user: {},
      form: {},
      snackbar: {open: false, message: '', color: 'info'},
      _hunter: null,
    }
  },

  computed: {
    hunter() {
      if (this._hunter) {
        return this._hunter
      }
      if (this.bell.beckoner === this.user.uid) {
        this._hunter = {name: BeckonerName, caryll: BeckonerCaryll}
        return this._hunter
      }
      if (this.existsHunters[this.user.uid]) {
        this._hunter = this.existsHunters[this.user.uid]
        return this._hunter
      }
      this._hunter = this.generateHunterName()
      return this._hunter
    },

    existsHunters() {
      const ret = {}
      this.messages.forEach((message) => {
        ret[message.hunter.id] = message.hunter
      })
      return ret
    },
  },

  created() {
    const bell = this.$fireStore.collection('bells').doc(this.$route.params.bell)
    this.bellObj = bell
    bell.get().then((doc) => {
      if (!doc.exists) {
        this.$nuxt.error({
          statusCode: 404,
          message: 'No bell exist.'
        })
      }
    })
    this.$bind('bell', bell)
    this.$bind('messages', bell.collection('messages').orderBy('createdAt', 'desc'))

    this.$fireAuth.onAuthStateChanged((user) => {
      this.user = user || {}
      console.log('authchange', user)
    })
    this.$fireAuth.signInAnonymously().catch((e) => {
      console.log(e.code, e.message)
    })
  },

  methods: {
    toast(message, color='info') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.open = true
    },

    own(message) {
      return message.hunter.id === this.user.uid
    },

    reRingBell(id, { place, password, note }) {
      return this.$fireStore.collection('bells').doc(id).update({
        place, password, note,
        updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp()
      })
    },

    sendMessage(message) {
      const hunter = {
        id: this.user.uid,
        name: this.hunter.name,
        caryll: this.hunter.caryll
      }
      console.log(hunter, this.hunter)
      return this.bellObj.collection('messages').add({
        hunter: hunter,
        body: message.body,
        type: message.type,
        createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
      })
    },

    send() {
      this.toast('メッセージを送信しています…', 'info')
      this.sendMessage(this.form.text).then((res) => {
        console.log(res, res.id)
        this.toast('メッセージを送信しました。', 'success')
      }).catch((res) => {
        this.toast('エラーが発生しました。', 'error')
      })
    },

    generateHunterData() {
      let name = ''
      const limit = 1000
      const excludes = (Object.values(this.existsHunters))
      let i = 0
      do {
        const firstName = FirstNameList[Math.floor(Math.random() * FirstNameList.length)]
        const lastName = LastNameList[Math.floor(Math.random() * LastNameList.length)]
        name = `${firstName}の${lastName}`
      } while (excludes.includes(name) && i < limit)

      let caryll = ''
      const exists = Object.values(this.existCarylls)
      const availables =  CaryllRuneList.filter(caryll => !exists.includes(caryll))
      if ( availables.length > 0 ) {
        caryll = availables[Math.floor(Math.random() * availables.length)]
      } else {
        caryll = CaryllRuneList[Math.floor(Math.random() * CaryllRuneList.length)]
      }

      return {name, caryll}
    },

    dev() {
      console.log('dev')
    }
  },

  watch: {
    bell(val) {
      console.log(val)
    },
    user(val) {
      console.log(val)
    }
  },
}
</script>
