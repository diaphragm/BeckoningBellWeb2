<template>
  <v-layout calss="fab-container">
    <v-btn
      v-scroll="onScroll"
      v-show="fab"
      fab
      color="primary"
      @click="toTop"
    >
      <v-icon>mdi-chevron-up</v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
export default {
  props: [''],
  components: {
  },
  data() {
    return {
      fab: false
    }
  },
  methods: {
    onScroll (e) {
      if (typeof window === 'undefined') return
      const top = window.pageYOffset ||   e.target.scrollTop || 0
      this.fab = top > 20
    },
    toTop () {
      this.$vuetify.goTo(0)
    }
  }}
</script>

<style>
  .fab-container {
    position: fixed;
    bottom: 0;
    right: 0;
  }
</style>
