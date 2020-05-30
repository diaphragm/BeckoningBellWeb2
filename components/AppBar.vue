<template>
  <v-app-bar fixed dense app >
    <v-spacer />
    <v-toolbar-title>狩人呼びの鐘Web</v-toolbar-title>
    <v-spacer />
  </v-app-bar>
</template>

<script>
export default {
  props: ['bell'],
  components: {
  },
  data() {
    return {
      showMenu: false
    }
  },
  methods: {
  }
}
</script>
