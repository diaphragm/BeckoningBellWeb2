import Vue from 'vue'

const FirestoreBbwUtils = {
  install(Vue, options) {
    Vue.prototype.$ringBell = function({ place, password, note, region }) {
      console.log('ring bell', { place, password, note, region })
      return this.$fireStore.collection('bells').add({
        place, password, note, region,
        beckoner: this.user.uid,
        createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        silencedAt: null
      })
    }

    Vue.prototype.$reRingBell = function(id, { place, password, note, region}) {
      console.log('re-ring bell', {id, place, password, note, region})
      return this.$fireStore.collection('bells').doc(id).update({
        place, password, note,
        updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp()
      })
    }

    // Vue.prototype.$blankShot = function(id) {
    //   console.log('blank shot', {id})
    //   return this.$fireStore.collection('bells').doc(id).delete()
    // }
    Vue.prototype.$silenceBell = function (id) {
      console.log('silence bell', {id})
      return this.$fireStore.collection('bells').doc(id).update({
        silencedAt: this.$fireStoreObj.FieldValue.serverTimestamp()
      })
    }

    Vue.prototype.$sendMessage = function(bellId, hunter, message) {
      console.log('send message', {bellId, hunter, message})
      return this.$fireStore.collection('bells').doc(bellId).collection('messages').add({
        hunter: hunter,
        body: message.body,
        type: message.type,
        createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
      })
    }
  }
}

Vue.use(FirestoreBbwUtils)
