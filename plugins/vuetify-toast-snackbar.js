// import Vue from 'vue'
// import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib'
// import VuetifyToast from 'vuetify-toast-snackbar'

// Vue.use(Vuetify, {
//   components: {
//     VSnackbar,
//     VBtn,
//     VIcon
//   }
// })

// Vue.use(VuetifyToast, {
//   x: null,
//   y: 'top'
// })


// solve vuetify-toast-snackbar probrem
// https://github.com/eolant/vuetify-toast-snackbar/issues/42#issuecomment-646496012
import Vue from 'vue'
import VuetifyToast from 'vuetify-toast-snackbar'

export default ({$vuetify}) => {
  Vue.use(VuetifyToast, {
    $vuetify,
    x: null,
    y: 'top'
  })
}
