<template>
  <v-snackbar v-model="snackbar.open" :color="snackbar.color" :timeout="2000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      snackbar: {open: false, message: '', color: 'info'},
    }
  },
  methods: {
    toast(message, color='info') {
      console.log(message)
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.open = true
    },
  }
}
</script>
