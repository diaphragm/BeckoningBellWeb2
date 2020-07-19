<template>
  <v-content>
    <v-container>
      <v-toolbar dense flat>
        <v-spacer />
        <notification-toggle-button />
      </v-toolbar>
      <div class="text-center">
        <h1>狩人呼びの鐘Web</h1>
        <h2>The Old Hunters</h2>
      </div>

      <v-card class="ma-2">
        <v-card-text>
          <p>Bloodborneの協力プレイ募集サイトです。</p>
          <p>Twitterでの募集機能、定型文やスタンプが使えるチャット機能があります。</p>
        </v-card-text>

        <!-- <ornament-separator /> -->
        <v-divider />

        <v-card-title>
          鐘を鳴らす
        </v-card-title>
        <v-card-text class="pb-0">
          <bell-form ref="bellForm" :form="form" />
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="primary" @click="submit">
            鐘を鳴らす
          </v-btn>
        </v-card-actions>

        <!-- <ornament-separator /> -->
        <v-divider />

        <v-card-title>
          現在募集中の鐘
        </v-card-title>
        <v-card-text>
          <template v-if="bells.length">
            <bells-table :bells="bells" />
          </template>
          <template v-else>
            募集中の鐘はありません。<a href="https://twitter.com/BloodborneVoyyy">Twitter</a>もご確認ください。
          </template>
        </v-card-text>
      </v-card>
    </v-container>
  </v-content>
</template>

<script>
import BellsTable from '~/components/BellsTable.vue'
import OrnamentSeparator from '~/components/OrnamentSeparator.vue'
import BellForm from '~/components/BellForm.vue'
import Snackbar from '~/components/Snackbar.vue'
import NotificationToggleButton from '~/components/NotificationToggleButton.vue'

export default {
  components: {
    BellsTable,
    OrnamentSeparator,
    BellForm,
    Snackbar,
    NotificationToggleButton
  },
  data() {
    return {
      bells: [],
      form: {},
      snackbar: {open: false, message: '', color: 'info'},
    }
  },
  created() {
    this.$bind('bells', this.$fireStore.collection('bells').where('silencedAt', '==', null).orderBy('createdAt', 'desc'))
  },
  methods: {
    submit() {
      if (this.$refs.bellForm.validate()) {
        this.$toast.info('鐘を鳴らしています…')
        const data = this.form
        data.note = data.note || null
        this.$ringBell(data).then((res) => {
          console.log(res, res.id)
          this.$toast.success('チャット画面に移動します。')
          this.$router.push({path: `/${res.id}`})
        }).catch((res) => {
          this.$toast.error('エラーが発生しました。')
        })
      }
    },
  },
  watch: {
    bells(val) {
      console.log(val)
    }
  }
}
</script>
