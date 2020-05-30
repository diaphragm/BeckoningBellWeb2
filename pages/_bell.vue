<template>
  <v-app id="app">
    <app-bar :bell="bell"/>

    <v-content>
      <v-container class="main-container">
        <v-row justify="start">
          <v-col>
            <div class="caption">場所</div>
            <div class="body-1">{{ bell.place }}</div>
          </v-col>
          <v-col>
            <div class="caption">合言葉</div>
            <div class="body-1">{{ bell.password }}</div>
          </v-col>
        </v-row>
        <v-row  justify="center">
          <v-col>
            <div class="caption">備考</div>
            <div class="body-2">{{ bell.note }}</div>
          </v-col>
        </v-row>

        <v-divider />

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
import { BeckonerName, generateHunterNam, BeckonerCaryll, CaryllRuneList } from '~/plugins/BloodborneUtils.js'
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
      _hunter_name: null,
      _caryll: null
    }
  },
  computed: {
    hunterName() {
      if (this._hunter_name) {
        return this._hunter_name
      }
      if (this.bell.beckoner === this.user.uid) {
        this._hunter_name = BeckonerName
        return this._hunter_name
      }
      if (this.hunters[this.user.uid]) {
        this._hunter_name = this.hunters[this.user.uid].name
        return this._hunter_name
      }
      this._hunter_name = generateHunterName(Object.values(this.hunters))
      return this._hunter_name
    },
    // hunterCaryll() {
    //   if (this._caryll) {
    //     return this._caryll
    //   }
    //   if (this.bell.beckoner === this.user.uid) {
    //     this._caryll = BeckonerCaryll
    //     return this._caryll
    //   }
    //   if (this.hunters[this.user.uid]) {
    //     this._caryll = this.hunters[this.user.uid].caryll
    //     return this._caryll
    //   }
    //   this._caryll = generateHunterName(Object.values(this.hunters))
    //   return this._caryll
    // },
    hunters() {
      const dic = {}
      this.messages.forEach((message) => {
        dic[message.hunter.id] = message.hunter.name
      })
      return dic
    }
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
      this.user = user
      console.log(user)
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
        name: this.hunterName,
        // caryll: this.hunterCaryll
      }
      console.log(hunter)
      return this.bellObj.collection('messages').add({
        hunter: hunter,
        body: message.body,
        type: message.type,
        createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
      })
    },
    send() {
      console.log(this.hunterName)
      this.toast('メッセージを送信しています…', 'info')
      this.sendMessage(this.form.text).then((res) => {
        console.log(res, res.id)
        this.toast('メッセージを送信しました。', 'success')
      }).catch((res) => {
        this.toast('エラーが発生しました。', 'error')
      })
    },
    dev() {
      console.log(generateHunterName())
    }
  },
  watch: {
    bell(val) {
      console.log(val)
    },
    user(val) {
      console.log(val)
    }
  }
}
</script>

<style scoped>
  .main-container {
    max-width: 800px;
  }
</style>
