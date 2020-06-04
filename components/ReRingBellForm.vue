<template>
  <div>
    <v-btn icon @click.stop="openDialog">
      <v-icon>mdi-bell-plus</v-icon>
    </v-btn>

    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title>
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
        <v-card-title>
          募集を終了する
        </v-card-title>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="error" @click="stopDialog = true">
            空砲を鳴らす
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="stopDialog">
      <v-card>
        <v-card-title>
          共鳴破りの空砲
        </v-card-title>
        <v-card-text>
          募集を終了しますか？
        </v-card-text>
        <v-card-actions>
          <v-btn @click.stop="stopDialog = false">
            キャンセル
          </v-btn>
          <v-btn color="error" @click="stop">
            終了する
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
      stopDialog: false,
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
        this.dialog = false
        this.$toast.info('鐘の情報を更新しています…')
        const data = this.form
        data.note = data.note || null
        this.$reRingBell(this.bell.id, this.form)
        .then(() => {
          const body = `鐘の情報が更新されました。`
          const hunter = {id: 'remote', name: 'system', caryll: ''}
          const message = {body: body, type: 'system'}
          return this.$sendMessage(this.bell.id, hunter, message)
        }).then(() => {
          this.$toast.success('鐘の情報を更新しました。')
        }).catch((error) => {
          console.log(error)
          this.$toast.error('エラーが発生しました。')
        })
      }
    },
    stop() {
      this.dialog = false
      this.stopDialog = false
      this.$silenceBell(this.bell.id).then(() => {
        this.$toast.success('募集を終了しました。')
      }).catch((error) => {
        console.log(error)
        this.$toast.error('エラーが発生しました。')
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
