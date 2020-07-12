<template>
  <div>
    <v-navigation-drawer app v-model="drawer" :permanent="permanent">
      <v-list nav>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>場所</v-list-item-subtitle>
            <v-list-item-title>{{ bell.place }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>合言葉</v-list-item-subtitle>
            <v-list-item-title>{{ bell.password }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>マッチング範囲</v-list-item-subtitle>
            <v-list-item-title>{{ bell.region }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle>備考</v-list-item-subtitle>
            <!-- <v-card flat>
              <v-card-text> {{ bell.note }} </v-card-text>
            </v-card> -->
            <p>
              {{ bell.note }}
            </p>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list nav v-if="bell.beckoner == $uid">
        <v-divider />
        <v-list-item>
          <re-ring-bell-form :bell="bell" />
        </v-list-item>
        <v-list-item>
          <silencing-bell-form :bell="bell" />
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app dense hide-on-scroll inverted-scroll>
      <v-app-bar-nav-icon v-if="!permanent" @click="drawer = !drawer" />
      <v-spacer />
      <v-toolbar-title>狩人呼びの鐘Web</v-toolbar-title>
      <v-spacer />
      <v-btn @click="home" icon><v-icon>mdi-home</v-icon></v-btn>
      <notification-toggle-button />
    </v-app-bar>
  </div>
</template>

<script>
import ReRingBellForm from '~/components/ReRingBellForm.vue'
import SilencingBellForm from '~/components/SilencingBellForm.vue'
import NotificationToggleButton from '~/components/NotificationToggleButton.vue'


export default {
  props: ['bell'],
  components: {
    ReRingBellForm,
    SilencingBellForm,
    NotificationToggleButton
  },
  data() {
    return {
      drawer: true,
    }
  },
  computed: {
    permanent() {
      return this.$vuetify.breakpoint.mdAndUp
    }
  },
  mounted() {
    this.watchUid()
  },
  methods: {
    home() {
      this.$router.push({path: '/'})
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
</style>
