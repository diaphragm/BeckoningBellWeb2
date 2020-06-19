<template>
  <div>
    {{ token }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: ''
    }
  },
  created() {
    console.log({fireMess: this.$fireMess})
    this.$fireMess.getToken().then(token => {
      console.log(token)
      this.token = token
    })
  }
}
</script>
