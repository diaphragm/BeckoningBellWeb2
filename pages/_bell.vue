<template>
  <v-app id="app">

    <v-content>
      <app-bar :bell="bell" :user="user" />

      <v-container class="main-container">
        <v-row justify="center">
          <v-col>
            <message-list :messages="messages" :user="user" />
          </v-col>
        </v-row>
      </v-container>
    </v-content>

    <bottom-navigation @click="sendMessage" />

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
import MessageList from '~/components/MessageList.vue'
import AppBar from '~/components/AppBar.vue'
import BottomNavigation from '~/components/BottomNavigation.vue'
import ScrollButton from '~/components/ScrollButton.vue'

export default {
  layout: 'bell',

  components: {
    MessageList, AppBar, BottomNavigation, ScrollButton
  },

  data() {
    return {
      bellObj: null,
      bell: {},
      localMessages: [],
      remoteMessages: [],
      user: {},
      form: {},
      snackbar: {open: false, message: '', color: 'info'},
      _userName: null,
      _userCaryll: null,
    }
  },

  computed: {
    messages() {
      return this.remoteMessages
        .concat(this.localMessages)
        .filter(m => m.createdAt)
        .sort((a, b) => {
          return b.createdAt.seconds - a.createdAt.seconds
        })
    },

    isBeckoner() {
      return this.bell.beckoner && this.user.uid && (this.bell.beckoner === this.user.uid)
    },

    // hunter.name, hunter.caryllにオブジェクトにするとcomputedが効かなくなるので値ごとにする
    userName() {
      if (this._userName) {
        return this._userName
      }
      if (this.isBeckoner) {
        this._userName = BeckonerName
        return this._userName
      }
      if (this.existsHunters[this.user.uid]) {
        this._userName = this.existsHunters[this.user.uid].name
        return this._userName
      }
      this._userName = this.generateHunterName()
      return this._userName
    },

    userCaryll() {
      if (this._userCaryll) {
        return this._userCaryll
      }
      if (this.isBeckoner) {
        this._userCaryll = BeckonerCaryll
        return this._userCaryll
      }
      if (this.existsHunters[this.user.uid]) {
        this._userCaryll = this.existsHunters[this.user.uid].caryll
        return this._userCaryll
      }
      this._userCaryll = this.generateHunterCaryll()
      return this._userCaryll
    },

    existsHunters() {
      const ret = {}
      this.remoteMessages.forEach((message) => {
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
    this.$bind('remoteMessages', bell.collection('messages').orderBy('createdAt', 'desc'))

    this.$fireAuth.onAuthStateChanged((user) => {
      this.user = user || {}
    })
    this.$fireAuth.signInAnonymously().catch((e) => {
      console.log(e.code, e.message)
    })
  },

  mounted() {
    this.sendLocalSystemMessage(`
      狩人呼びの鐘Webへようこそ。下部にあるボタンから、定型文やスタンプを送信できます。
      ホスト(狩りの主)以外のユーザー名は、自動でランダムに選ばれます。
    `)
  },

  methods: {
    toast(message, color='info') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.open = true
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
        name: this.userName,
        caryll: this.userCaryll
      }
      this.bellObj.collection('messages').add({
        hunter: hunter,
        body: message.body,
        type: message.type,
        createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
      })

      this.$vuetify.goTo(0)
    },

    sendLocalSystemMessage(body) {
      const createdAt = new this.$fireStoreObj.Timestamp.fromDate(new Date)
      const hunter = {
        id: 'local',
        name: 'system',
        caryll: ''
      }
      this.localMessages.push({
        hunter: hunter,
        body: body,
        type: 'system',
        createdAt: createdAt
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

    generateHunterName() {
      let name = ''
      const limit = 1000
      const excludes = Object.values(this.existsHunters).map(hunter => hunter.name)
      let i = 0
      do {
        const firstName = FirstNameList[Math.floor(Math.random() * FirstNameList.length)]
        const lastName = LastNameList[Math.floor(Math.random() * LastNameList.length)]
        name = `${firstName}の${lastName}`
      } while (excludes.includes(name) && i < limit)

      return name
    },

    generateHunterCaryll() {
      let caryll = ''
      const exists = Object.values(this.existsHunters).map(hunter => hunter.caryll)
      const availables =  CaryllRuneList.filter(caryll => !exists.includes(caryll))
      if ( availables.length > 0 ) {
        caryll = availables[Math.floor(Math.random() * availables.length)]
      } else {
        caryll = CaryllRuneList[Math.floor(Math.random() * CaryllRuneList.length)]
      }

      return caryll
    },

    dev() {
      console.log('dev')
    }
  },

  watch: {
    isBeckoner(val, old) {
      if (val && !old) {
        this.sendLocalSystemMessage(`
          右上のボタンから募集を終了したり、鐘の情報を更新することができます。
          鐘の情報を更新することで、Twitterで再募集することができます。
        `)
        this.sendLocalSystemMessage(`
          募集は一定時間で自動的に終了しますが、他の協力者のためにも協力プレイを終える際には手動で募集を終了するようご協力をお願いします。
        `)
      }
    }
  },
}
</script>
