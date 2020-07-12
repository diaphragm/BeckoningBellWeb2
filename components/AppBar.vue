<template>
  <div>
    <v-navigation-drawer app v-model="drawer" :permanent="permanent">
      <template v-if="$uid && bell.beckoner == $uid">
        <v-list nav>
          <v-list-item>
            <re-ring-bell-form :bell="bell" />
          </v-list-item>
          <v-list-item>
            <silencing-bell-form :bell="bell" />
          </v-list-item>
        </v-list>

        <v-divider />
      </template>

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
            <p>
              <span v-html="htmlize(bell.note)"></span>
            </p>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list-item>
        <v-list-item-subtitle>
          共鳴中の狩人
        </v-list-item-subtitle>
      </v-list-item>
      <v-list nav v-for="hunter in hunters" :key="hunter.id">
        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="`caryll/${hunter.caryll}`" height="32" contain />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ hunter.name }}</v-list-item-title>
            <v-list-item-subtitle v-if="hunter.id == $uid">あなた</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app dense :inverted-scroll="hide" v-resize="resized" v-scroll="resized">
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
  props: ['bell', 'hunters'],
  components: {
    ReRingBellForm,
    SilencingBellForm,
    NotificationToggleButton
  },
  data() {
    return {
      drawer: true,
      hide: false,
    }
  },
  computed: {
    permanent() {
      return this.$vuetify.breakpoint.mdAndUp
    },
  },
  methods: {
    htmlize(text) {
      if (!text) return ''
      return this.$sanitizeBr(text.replace('\n', '<br>'))
    },
    home() {
      this.$router.push({path: '/'})
    },
    resized(e) {
      this.hide = window.innerHeight < this.$nuxt.$el.scrollHeight - 48
    }
  },
}
</script>

<style scoped>
</style>
