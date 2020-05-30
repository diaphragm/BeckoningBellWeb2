<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <div class="text-center">
        <h1>狩人呼びの鐘Web</h1>
        <h2>The Old Hunters</h2>
      </div>

      <v-card>
        <v-card-title class="headline">
          鐘を鳴らす
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="form.valid">
            <group-select v-model="form.place" :items="placeList" :rules="[required]" label="場所"
              hint="どこで鐘をならしていますか？"/>
            <v-text-field v-model="form.password" label="合言葉" persistent-hint :rules="[required]"
              hint="合言葉を設定しないと、レベル差がある他のプレイヤーとのマルチプレイができません。" />
            <v-text-field v-model="form.note" label="備考" persistent-hint
              hint="周回数、レベル、プレイ方針、契約カレル、聖杯ダンジョンの内容などを書くと親切かもしれません。" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="submit">
            鐘を鳴らす
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card>
        <v-card-title>
          現在募集中の鐘
        </v-card-title>
        <v-card-text>
          <template v-if="bells.length">
            <bells-table :bells="bells"/>
          </template>
          <template v-else>
            募集中の鐘はありません。<a href="https://twitter.com/BloodborneVoyyy">Twitter</a>もご確認ください。
          </template>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-snackbar v-model="snackbar.open" :color="snackbar.color" :timeout="2000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
Vue.use(firestorePlugin)
import { PlaceList } from '~/plugins/BloodborneUtils.js'
import GroupSelect from '~/components/GroupSelect.vue'
import BellsTable from '~/components/BellsTable.vue'

export default {
  components: {
    GroupSelect,
    BellsTable
  },
  data() {
    return {
      user: {},
      bells: [],
      form: {},
      placeList: PlaceList,
      snackbar: {open: false, message: '', color: 'info'},
      required: v =>  v ? true : '入力は必須です。',
    }
  },
  created() {
    this.$bind('bells', this.$fireStore.collection('bells').orderBy('createdAt', 'desc'))
    // this.$bind('messages', this.$fireStore.collection('bells').doc('pDzUSHX77FHbmOrs97ns').collection('messages'))
    // this.$bind('bell', this.$fireStore.collection('bells').doc('pDzUSHX77FHbmOrs97ns'))

    this.$fireAuth.onAuthStateChanged((user) => {
      this.user = user
      console.log(user)
    })
    this.$fireAuth.signInAnonymously().catch((e) => {
      console.log(e.code, e.message)
    })
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.toast('鐘を鳴らしています…', 'info')
        this.ringBell(this.form).then((res) => {
          console.log(res, res.id)
          this.toast('チャット画面に移動します。', 'success')
        }).catch((res) => {
          this.toast('エラーが発生しました。', 'error')
        })
      }
    },
    toast(message, color='info') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.open = true
    },
    ringBell({ place, password, note }) {
      return this.$fireStore.collection('bells').add({
          place, password, note,
          beckoner: this.user.uid,
          createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
      })
    },
    reRingBell(id, { place, password, note }) {
      return this.$fireStore.collection('bells').doc(id).update({
        place, password, note,
        updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp()
      })
    }
  },
  watch: {
    bells(val) {
      console.log(val)
    }
  }
}
</script>
