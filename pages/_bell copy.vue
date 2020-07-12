<template>
  <v-content>
    <app-bar :bell="bell" />

    <v-container class="main-container">
      <v-row justify="center">
        <v-col>
          <message-list :messages="messages" />
        </v-col>
      </v-row>
    </v-container>

    <bottom-navigation @click="sendMessage" />
    <ScrollButton />

    <v-dialog v-model="silenced" persistent max-width="290">
      <v-card>
        <v-card-title class="justify-center">募集は終了しました</v-card-title>
        <v-card-text class="text-center font-italic">
          我ら血によって人となり<br>
          人を超え<br>
          また人を失う<br>
          知らぬ者よ<br>
          かねて血を恐れたまえ
        </v-card-text>
        <v-card-actions>
          <v-spacer />
            <v-btn nuxt to='/' text>TOPへ戻る</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-content>
</template>

<script>
import { BeckonerName, BeckonerCaryll, CaryllRuneList, FirstNameList, LastNameList} from '~/assets/BloodborneUtils.js'
import MessageList from '~/components/MessageList.vue'
import AppBar from '~/components/AppBar.vue'
import BottomNavigation from '~/components/BottomNavigation.vue'
import ScrollButton from '~/components/ScrollButton.vue'

export default {
  components: {
    MessageList, AppBar, BottomNavigation, ScrollButton
  },

  data() {
    return {
      bellObj: null,
      bell: {},
      localMessages: [],
      remoteMessages: [],
      form: {},
      silenced: false,
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
      return this.bell.beckoner && this.$uid && (this.bell.beckoner === this.$uid)
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
      if (this.existsHunters[this.$uid]) {
        this._userName = this.existsHunters[this.$uid].name
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
      if (this.existsHunters[this.$uid]) {
        this._userCaryll = this.existsHunters[this.$uid].caryll
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
  },

  mounted() {
    this.sendLocalSystemMessage(`
      狩人呼びの鐘Webへようこそ。下部にあるボタンから、定型文やスタンプを送信できます。<br>
      ホスト(狩りの主)以外のユーザー名は、自動でランダムに選ばれます。
    `)
  },

  methods: {
    sendMessage(message) {
      const hunter = {
        id: this.$uid,
        name: this.userName,
        caryll: this.userCaryll
      }
      this.$sendMessage(this.bell.id, hunter, message).then(() => {
        this.$vuetify.goTo(0)
      })
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
        const icon = '<i class="v-icon notranslate mdi mdi-bell-plus"></i>'
        this.sendLocalSystemMessage(`
          右上の${icon}から募集を終了したり、鐘の情報を更新することができます。<br>
          鐘の情報を更新することで、Twitterで再募集することができます。<br>
          <br>
          募集は一定時間で自動的に終了しますが、他の協力者のためにも協力プレイを終える際には手動で募集を終了するようご協力をお願いします。
        `)
      }
    },
    'bell.silencedAt': function(val) {
      this.silenced = !!val
    }
  },
}
</script>
