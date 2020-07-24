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
              <span v-html="$htmlize(bell.note)"></span>
            </p>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider />
      <v-list nav>
        <v-list-item>
          <v-list-item-subtitle>
            共鳴中の狩人
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-for="hunter in hunters" :key="hunter.id">
          <v-list-item-avatar>
            <v-img :src="`caryll/${hunter.caryll}`" height="32" contain />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ hunter.name }}</v-list-item-title>
            <v-list-item-subtitle v-if="hunter.id == $uid">あなた</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action v-if="$uid && bell.beckoner == $uid && hunter.id != $uid">
            <v-btn icon @click="toggleBeast(hunter)"><v-icon color="grey">
              {{ hunter.isBeast ? 'mdi-account-cancel' : 'mdi-account' }}
            </v-icon></v-btn>
          </v-list-item-action>
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
    home() {
      this.$router.push({path: '/'})
    },
    resized(e) {
      this.hide = window.innerHeight < this.$nuxt.$el.scrollHeight - 48
    },
    toggleBeast(hunter) {
      const message = hunter.isBeast ?
        `「${hunter.name}」のメッセージを表示しますか？` :
        `「${hunter.name}」のメッセージを非表示にしますか？
        <div class="pa-1">
        - 他の狩人の画面にも表示されなくなります。<br>
        - 「${hunter.name}」には秘匿されます。
        </div>
        <div class="beast pt-6">
          どこもかしこも、獣ばかりだ…
        </div>
        `
      this.$confirm(message).then((res) => {
        if (res) {
          const ref = this.$fireStore.collection('bells').doc(this.bell.id).collection('hunters').doc(hunter.id)
          ref.update({
            isBeast: !hunter.isBeast
          })
        }
      })
    }
  },
}
</script>

<style>
.beast {
  color: #b2b2b2;
  font-size: small;
  font-style: italic;
  text-align: center;
}
</style>
