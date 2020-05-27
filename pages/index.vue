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
        <logo />
        <vuetify-logo />
      </div>
      <v-card>
        <v-card-title class="headline">
          Welcome to the Vuetify + Nuxt.js template
        </v-card-title>
        <v-card-text>
          <p>Vuetify is a progressive Material Design component framework for Vue.js. It was designed to empower developers to create amazing applications.</p>
          <p>
            For more information on Vuetify, check out the <a
              href="https://vuetifyjs.com"
              target="_blank"
            >
              documentation
            </a>.
          </p>
          <p>
            If you have questions, please join the official <a
              href="https://chat.vuetifyjs.com/"
              target="_blank"
              title="chat"
            >
              discord
            </a>.
          </p>
          <p>
            Find a bug? Report it on the github <a
              href="https://github.com/vuetifyjs/vuetify/issues"
              target="_blank"
              title="contribute"
            >
              issue board
            </a>.
          </p>
          <p>Thank you for developing with Vuetify and I look forward to bringing more exciting features in the future.</p>
          <div class="text-xs-right">
            <em><small>&mdash; John Leider</small></em>
          </div>
          <hr class="my-3">
          <a
            href="https://nuxtjs.org/"
            target="_blank"
          >
            Nuxt Documentation
          </a>
          <br>
          <a
            href="https://github.com/nuxt/nuxt.js"
            target="_blank"
          >
            Nuxt GitHub
          </a>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            nuxt
            to="/inspire"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card>
        <v-card-title>
          Bells
        </v-card-title>
        <v-card-text>
          <div v-for="(bell, i) in bells" :key="i">
            {{ bell.id }} <br>
            {{ bell }}
          </div>
          <div v-for="(message, i) in messages" :key="i+1000">
            {{ message }}
          </div>
        </v-card-text>
        {{ bell }}
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="addBell"
          >
            addBell
          </v-btn>
          <v-btn
            color="primary"
            @click="updateBell"
          >
            updateBell
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'
Vue.use(firestorePlugin)

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  data: function() {
    return {
      bells: [],
      messages: [],
      bell: {},
    }
  },
  created: function() {
    this.$bind('bells', this.$fireStore.collection('bells'))
    this.$bind('messages', this.$fireStore.collection('bells').doc('pDzUSHX77FHbmOrs97ns').collection('messages'))
    this.$bind('bell', this.$fireStore.collection('bells').doc('pDzUSHX77FHbmOrs97ns'))
    console.log(this.messages)
  },
  methods: {
    addBell: async function() {
      const bell = await this.$fireStore.collection('bells').add({
        place: '聖杯ダンジョン',
        password: 'abcdefg',
        note: '9kv8xiyi'
      })
      console.log(bell)
    },
    updateBell: async function() {
      const bell = this.$fireStore.collection('bells').doc('pDzUSHX77FHbmOrs97ns')
      await bell.set({
        place: Math.random() * 1e16
      })
      console.log(bell.data)
    }
  },
  watch: {
    bell: {
      handler:function(val) {
        console.log(val)
      },
      deep: false
    }
  }
}
</script>
