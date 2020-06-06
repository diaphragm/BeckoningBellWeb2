import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as Twitter from 'twitter'

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


// export const onCreateBellTrigger = functions
//   .region('asia-northeast1')
//   .firestore
//   .document('bells/{bellId}')
//   .onCreate((snap, context) => {
//     admin.firestore().collection('bells').doc(snap.id).update({
//       createdAt: admin.firestore.FieldValue.serverTimestamp()
//     }).then((status) => {
//       console.log(status)
//       return 0
//     }).catch((status) => {
//       console.log(status)
//       return 1
//     })
//   })

// export const onUpdateBellTrigger = functions
//   .region('asia-northeast1')
//   .firestore
//   .document('bells/{bellId}')
//   .onUpdate((change, context) => {
//     admin.firestore().collection('bells').doc(change.after.id).update({
//       updatedAt: admin.firestore.FieldValue.serverTimestamp()
//     }).then((status) => {
//       console.log(status)
//       return 0
//     }).catch((status) => {
//       console.log(status)
//       return 1
//     })
// })


export const printenv = functions.https.onRequest((req, res) => {
  console.log('functions.config()', functions.config())
  console.log('process.env', process.env)
  res.send("Please check firebase dashboard.")
})

const client = new Twitter(functions.config().twitter)
const tweet = (status: String) => {
  return client.post('statuses/update', { status })
}

const genTweetUrl = (tweet: Twitter.ResponseData): String => {
  return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
}


export const dev = functions.https.onRequest((req, res) => {
  tweet('test')
  res.send('tweeted')
})

export const onRingedBellTritter = functions
  .region('asia-northeast1')
  .firestore
  .document('bells/{bellId}')
  .onCreate((snap, context) => {
    const id = snap.id
    const {place, note} = snap.data() || {}
    const url = `${functions.config().app.base_url}${id}`
    const message = `${place}で鐘を鳴らしています。 ${url}\n${note}`

    tweet(message).then(tweet => {
      const url = genTweetUrl(tweet)
      return admin.firestore().collection('bells').doc(snap.id).update({
        tweetUrl: url
      })
    }).catch(error => {
      console.error(error)
    })
  })
