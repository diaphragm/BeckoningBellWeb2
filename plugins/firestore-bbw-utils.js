import Vue from 'vue'

const FirestoreBbwUtils = {
  install(Vue, options) {
    const BellAttrList = ['place', 'password', 'note', 'region']

    const compactObj = (obj) => {
      Object.entries(obj).forEach(([key, value]) => {
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
      const data = compactBell(bell)
      data.beckoner = this.$uid
      data.createdAt = this.$fireStoreObj.FieldValue.serverTimestamp()
      data.updatedAt = this.$fireStoreObj.FieldValue.serverTimestamp()
      data.silencedAt = null

      return this.$fireStore.collection('bells').add(data)
    }

    Vue.prototype.$reRingBell = function(id, bell) {
      const data = compactBell(bell)
      data.updatedAt = this.$fireStoreObj.FieldValue.serverTimestamp()

      return this.$fireStore.collection('bells').doc(id).update(data)
    }

    Vue.prototype.$silenceBell = function (id) {
      return this.$fireStore.collection('bells').doc(id).update({
        silencedAt: this.$fireStoreObj.FieldValue.serverTimestamp()
      })
    }

    Vue.prototype.$sendMessage = function(bellId, hunterId, message) {
      return this.$fireStore.collection('bells').doc(bellId).collection('messages').add({
        hunter: hunterId,
        body: message.body,
        type: message.type,
        createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
      })
    }

    Vue.prototype.$fcmToken = null

    Vue.prototype.$fcmSyncToken = async function () {
      return this.$fireMess.getToken().then(async (token) => {

        Vue.prototype.$fcmToken = token
        const ref = this.$fireStore.collection('hunters').doc(this.$uid)
        const snap = await ref.get()
        if (snap.exists) {
          ref.update({
            token,
            updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
           })
        } else {
          ref.set({
            token,
            createdAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
            updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
          })
        }
      })
    }

    Vue.prototype._getTokenPromise = async function () {
      if (!this.$fcmToken) {
        return this.$fcmSyncToken()
      }
    }

    Vue.prototype.$fcmSubscribeBell = async function (bellId) {
      return this._getTokenPromise().then(() => {
        return this.$fireStore.collection('hunters').doc(this.$uid).update({
          subscriptions: this.$fireStoreObj.FieldValue.arrayUnion(bellId),
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        })
      })
    }

    Vue.prototype.$fcmUnSubscribeBell = async function (bellId) {
      return this._getTokenPromise().then(() => {
        this.$fireStore.collection('hunters').doc(this.$uid).update({
          subscriptions: this.$fireStoreObj.FieldValue.arrayRemove(bellId),
          updatedAt: this.$fireStoreObj.FieldValue.serverTimestamp(),
        })
      })
    }

    Vue.prototype.$fcmSubscriptions = async function () {
      if (!this.$uid) return []

      const snap = await this.$fireStore.collection('hunters').doc(this.$uid).get()
      return (snap.data() && snap.data().subscriptions) || []
    }
  }
}

Vue.use(FirestoreBbwUtils)
