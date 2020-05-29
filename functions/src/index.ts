import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp()

export const onCreateBellTrigger = functions
  .region('asia-northeast1')
  .firestore
  .document('bells/{bellId}')
  .onCreate((snap, context) => {
    admin.firestore().collection('bells').doc(snap.id).update({
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }).then((status) => {
      console.log(status)
      return 0
    }).catch((status) => {
      console.log(status)
      return 1
    })
  })

export const onUpdateBellTrigger = functions
  .region('asia-northeast1')
  .firestore
  .document('bells/{bellId}')
  .onUpdate((change, context) => {
    admin.firestore().collection('bells').doc(change.after.id).update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }).then((status) => {
      console.log(status)
      return 0
    }).catch((status) => {
      console.log(status)
      return 1
    })
})
