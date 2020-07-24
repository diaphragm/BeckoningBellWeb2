<template>
  <v-content>
    <v-container>
      <v-toolbar dense flat>
        <v-spacer />
        <notification-toggle-button />
      </v-toolbar>

      <v-row>
        <v-col class="text-center site-title">
          <h1>狩人呼びの鐘Web</h1>
          <h2>The Old Hunters</h2>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols=12 sm=8>
          <v-card class="main-card ma-2 pa-4">
            <v-card-text>
              Bloodborneの協力プレイ募集サイトです。<br>
              <a href="https://twitter.com/BloodborneVoyyy">Twitter</a>での募集機能、定型文やスタンプが使えるチャット機能、募集とチャットの通知機能があります。
            </v-card-text>

            <!-- <v-divider /> -->
            <ornament-separator />

            <v-card-title>
              鐘を鳴らす
            </v-card-title>
            <v-card-text class="pb-0">
              <bell-form ref="bellForm" :form="form" />
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn outlined color="primary" @click="submit">
                鐘を鳴らす
              </v-btn>
            </v-card-actions>

            <ornament-separator class="mt-6" />
            <!-- <v-divider /> -->
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
        </v-col>

        <v-col>
          <twitter-timeline ad-slot="4883796830" />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-right">
          <span class="copyright">
            © 2020 diaphragm
            <a href="https://github.com/diaphragm" target="_blank" rel="noopener noreferrer">
              <v-img src="/img/GitHub-Mark-32px.png" height="1em" width="1em" />
            </a>
          </span>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
import BellsTable from '~/components/BellsTable.vue'
import OrnamentSeparator from '~/components/OrnamentSeparator.vue'
import BellForm from '~/components/BellForm.vue'
import Snackbar from '~/components/Snackbar.vue'
import NotificationToggleButton from '~/components/NotificationToggleButton.vue'
import TwitterTimeline from '~/components/TwitterTimeline.vue'

export default {
  components: {
    BellsTable,
    OrnamentSeparator,
    BellForm,
    Snackbar,
    NotificationToggleButton,
    TwitterTimeline
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

<style lang="scss" scoped>
.copyright {
  color: #808080;
  font-size: x-small;
  .v-image {
    display: inline-block;
    filter: invert(50%);
  }
}
</style>
