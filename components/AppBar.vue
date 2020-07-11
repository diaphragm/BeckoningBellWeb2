<template>
  <v-card class="floating-toolbar">
      <v-toolbar dense flat>
        <template v-if="showMenu">
          <v-btn icon @click="home">
            <v-icon>mdi-home</v-icon>
          </v-btn>

            <v-spacer />
            <v-toolbar-title>狩人呼びの鐘Web</v-toolbar-title>
            <v-spacer />

          <re-ring-bell-form :bell="bell" />

          <!-- <v-btn icon @click="toggleSubscription">
            <v-icon v-if="isSub">mdi-message-bulleted</v-icon>
            <v-icon v-else>mdi-message-bulleted-off</v-icon>
          </v-btn> -->
          <notification-toggle-button />
        </template>
        <v-btn icon @click="showMenu = !showMenu">
          <v-icon>
            {{ showMenu? 'mdi-chevron-left' : 'mdi-chevron-right'}}
          </v-icon>
        </v-btn>
      </v-toolbar>

    <template v-if="showMenu">
      <v-card-text>{{ bell.place }}で鳴らしています。</v-card-text>
      <v-divider />
      <v-card-text>
        <span class="mr-2">合言葉：{{ bell.password }}</span>
        <span>({{ bell.region }})</span>
      </v-card-text>
      <v-divider />
      <v-card-text>{{ bell.note }}</v-card-text>
    </template>
  </v-card>
</template>

<script>
import ReRingBellForm from '~/components/ReRingBellForm.vue'
import NotificationToggleButton from '~/components/NotificationToggleButton.vue'


export default {
  props: ['bell'],
  components: {
    ReRingBellForm,
    NotificationToggleButton
  },
  data() {
    return {
      showMenu: true,
      isSub: null
    }
  },
  mounted() {
    this.watchUid()
  },
  methods: {
    home() {
      this.$router.push({path: '/'})
    },
    toggleSubscription() {
      if ( this.isSub ) {
        this.$fcmUnSubscribeBell(this.bell.id)
      } else {
        this.$fcmSubscribeBell(this.bell.id)
      }
      this.isSub = !this.isSub
    },
    watchUid() {
      if (this.$uid) {
        this.$fcmSubscriptions().then(subscriptions => {
          this.isSub = subscriptions.includes(this.bell.id)
        })
      } else {
        setTimeout(this.watchUid, 10)
      }
    }
  },
}
</script>

<style scoped>
  .floating-toolbar {
    position: fixed;
    z-index: 10;
    top: 6px;
    left: -2px;

    max-width: 90vw;
  }
</style>
