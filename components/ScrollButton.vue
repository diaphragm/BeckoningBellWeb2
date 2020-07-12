<template>
  <v-btn
    class="bottom-overwrite"
    v-scroll="onScroll"
    v-show="fab"
    fab
    fixed
    right
    color="primary"
    @click="toTop"
  >
    <v-icon>mdi-chevron-up</v-icon>
  </v-btn>
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
      const top = window.pageYOffset || e.target.scrollTop || 0
      this.fab = top > 20
    },
    toTop () {
      this.$vuetify.goTo(0)
    }
  }}
</script>

<style scoped>
  .bottom-overwrite {
    bottom: 70px !important;
  }
</style>
