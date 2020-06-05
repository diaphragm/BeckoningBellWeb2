import Vue from 'vue'

const FirestoreBbwUtils = {
  install(Vue, options) {
    const BellAttrList = ['place', 'password', 'note', 'region']

    const compactObj = (obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(key)
        if (value === void 0) { delete obj[key] }
      })
    }

    const compactBell = (bell) => {
      const ret = {}
      BellAttrList.forEach((attr) => {
        ret[attr] = bell[attr]
      })
      compactObj(ret)

      return ret
    }

    Vue.prototype.$bellAttrList = BellAttrList

    Vue.prototype.$ringBell = function(bell) {
      console.log('ring bell', bell)
      const data = compactBell(bell)
      data.beckoner = this.user.uid
      data.createdAt = this.$fireStoreObj.FieldValue.serverTimestamp()
      data.updatedAt = this.$fireStoreObj.FieldValue.serverTimestamp()
      data.silencedAt = null

      return this.$fireStore.collection('bells').add(data)
    }

    Vue.prototype.$reRingBell = function(id, bell) {
      console.log('re-ring bell', {id, bell})
      const data = compactBell(bell)
      data.updatedAt = this.$fireStoreObj.FieldValue.serverTimestamp()

      return this.$fireStore.collection('bells').doc(id).update(data)
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
