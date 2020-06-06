<template>
  <div>
    <v-btn icon @click.stop="openDialog">
      <v-icon>mdi-bell-plus</v-icon>
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="justify-center">
          募集を終了する
        </v-card-title>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="error" @click="stop">
            空砲を鳴らす
          </v-btn>
        </v-card-actions>

        <v-divider class="mt-3"/>

        <v-card-title class="justify-center">
          鐘の情報を更新する
        </v-card-title>
        <v-card-text>
          <bell-form ref="bellForm" :form="form" />
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="primary" @click="submitForm">
            鐘を鳴らし直す
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BellForm from '~/components/BellForm.vue'

export default {
  props: ['bell'],
  data() {
    return {
      form: {},
      dialog: false,
      required: v =>  v ? true : '入力は必須です。',
    }
  },
  components: {
    BellForm
  },
  methods: {
    openDialog() {
      this.initForm()
      this.dialog = true
    },

    initForm() {
      this.valid = true
      this.form.place = this.bell.place
      this.form.password = this.bell.password
      this.form.note = this.bell.note
      this.form.region = this.bell.region
    },

    submitForm() {
      if (this.$refs.bellForm.validate()) {
        const diff = this.bellDiff(this.form, this.bell)
        if (!diff) {
          this.$toast.info('同じ内容です。')
          return
        }
        this.dialog = false
        this.$toast.info('鐘の情報を更新しています…')

        this.$reRingBell(this.bell.id, diff)
        .then(() => {
          this.sendReRingMessage(diff)
        }).then(() => {
          this.$toast.success('鐘の情報を更新しました。')
        }).catch((error) => {
          console.log(error)
          this.$toast.error('エラーが発生しました。')
        })
      }
    },

    sendReRingMessage(diff) {
      const attrName = {place: '場所', password: '合言葉', note: '備考', region: 'マッチング地域'}

      const body = '鐘の情報が更新されました。<br>'
      + Object.entries(diff).map(([key, value]) => {
        return `${attrName[key]}: ${value}`
      }).join('<br>')

      const hunter = {id: 'remote', name: 'system', caryll: ''}
      const message = {body: body, type: 'system'}

      return this.$sendMessage(this.bell.id, hunter, message)
    },

    bellDiff(newBell, oldBell) {
      const ret = {}
      this.$bellAttrList.forEach((attr) => {
        if (newBell[attr] !== oldBell[attr]) {
          ret[attr] = newBell[attr]
        }
      })
      if (Object.keys(ret).length > 0) {
        return ret
      } else {
        return null
      }
    },

    stop() {
      this.dialog = false
      this.$confirm('募集を終了しますか？').then((res) => {
        if (!res) { return }

        this.$silenceBell(this.bell.id).then(() => {
          this.$toast.success('募集を終了しました。')
        }).catch((error) => {
          console.log(error)
          this.$toast.error('エラーが発生しました。')
        })
      })
    },
  },
  watch: {
    bell: {
      handler(bell) {
        console.log('bell info changed', bell)
        // update直後はサーバー時刻がnullになるっぽい
        if (bell.updatedAt === null) { return }

        this.initForm()
      },
      deep: true
    }
  }
}
</script>