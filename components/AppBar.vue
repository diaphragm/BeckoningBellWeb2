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

        <v-btn icon>
          <v-icon>mdi-tune</v-icon>
        </v-btn>
        </template>
        <v-btn icon @click="showMenu = !showMenu">
          <v-icon>
            {{ showMenu? 'mdi-chevron-left' : 'mdi-chevron-right'}}
          </v-icon>
        </v-btn>
      </v-toolbar>

    <template v-if="showMenu">
      <v-card-text>{{ bell.place }}で鳴らしています。</v-card-text>
      <v-divider/>
      <v-card-text>合言葉：{{ bell.password }}</v-card-text>
      <v-divider/>
      <v-card-text>{{ bell.note }}</v-card-text>
    </template>
  </v-card>
</template>

<script>
export default {
  props: ['bell', 'user'],
  components: {
  },
  data() {
    return {
      showMenu: true
    }
  },
  methods: {
    home() {
      this.$router.push({path: '/'})
    }
  }
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
bb
