import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as Twitter from 'twitter'
import { config } from './env.config.js'

admin.initializeApp()


// interface

interface Bell {
  [key: string]: string | FirebaseFirestore.Timestamp,
}


// const

const ENV: string = functions.config().app.env
const ENV_CONFIG: {[key: string]: any} = config[ENV]

const REGION = ENV_CONFIG['region']
const RETWEET_INTERVAL: number = ENV_CONFIG['retweetInterval']
const EXPIRE_TIME: number = ENV_CONFIG['bellBexpirationTime']
const BELL_ATTR_LIST = ['place', 'password', 'note', 'region', 'silencedAt']

const TwitterClient = new Twitter(functions.config().twitter)


// util function

const genTweetUrl = (tweet: Twitter.ResponseData): string => {
  return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
}

const bellDiff = (newBell: FirebaseFirestore.DocumentData, oldBell: FirebaseFirestore.DocumentData) => {
  const ret: Bell = {}
  BELL_ATTR_LIST.forEach((attr) => {
    if (newBell[attr] !== oldBell[attr]) {
      ret[attr] = newBell[attr]
    }
  })
  if (Object.keys(ret).length > 0) {
    return ret
  } else {
    return null
  }
}

const maintenanceBells = async (): Promise<void> => {
  const now = admin.firestore.Timestamp.fromDate(new Date)

  const targets = await admin.firestore().collection('bells').where('silencedAt', '==', null).get()
  targets.docs.forEach(async (doc) => {
    let time: FirebaseFirestore.Timestamp

    const messages = await doc.ref.collection('messages').orderBy('createdAt', 'desc').limit(1).get()
    const lastMessage = messages.docs[0]
    if (lastMessage) {
      time = lastMessage.data().createdAt
    } else {
      time = doc.data().createdAt
    }

    if (now.seconds - time.seconds > EXPIRE_TIME) {
      await doc.ref.update({
        silencedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    }
  })
}


// trigger

export const onCreatedBellTritter = functions
  .region(REGION)
  .firestore
  .document('bells/{bellId}')
  .onCreate(async (snap, context) => {
    const id = snap.id
    const {place, note} = snap.data() || {}
    const url = `${functions.config().app.base_url}${id}`
    const message = `${place}で鐘を鳴らしています ${url}\n${note}`

    try {
      const tweet = await TwitterClient.post('statuses/update', {
        status: message,
      })
      const tweetUrl = genTweetUrl(tweet)

      return admin.firestore().collection('bells').doc(snap.id).update({
        tweetUrl: tweetUrl
      })
    } catch (error) {
      console.error(error)
      return 1
    }
  })

export const onUpdatedBellTrigger = functions
  .region(REGION)
  .firestore
  .document('bells/{bellId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data()
    const oldData = change.before.data()

    const diff = bellDiff(newData, oldData)
    const interval = newData.updatedAt.seconds - oldData.updatedAt.seconds

    if (diff) {
      if (diff.silencedAt || interval > RETWEET_INTERVAL) {
        const id = change.after.id
        const { place, note, tweetUrl } = newData || {}
        const url = `${functions.config().app.base_url}${id}`
        const message = diff.silencedAt ?
          `【終了】 募集は終了しました` :
          `【更新】 ${place}で鐘を鳴らしています。 ${url}\n${note}`
        const status = `${message} ${tweetUrl}`
        const tweetId = tweetUrl.match(/\d+$/)[0]

        try {
          await TwitterClient.post('statuses/update', {
            status: status,
            in_reply_to_status_id: tweetId
          })
        } catch (error){
          console.error(error)
          return 1
        }
      }
    }

    return 0
  })

export const scheduledFunction = functions
  .region(REGION)
  .pubsub
  .schedule('every 10 minutes')
  .onRun(async (context) => {
    await maintenanceBells()

    return 0
  })


// debug

export const printenv = functions
  .region(REGION)
  .https.onRequest((req, res) => {
    console.log('functions.config()', functions.config())
    console.log('process.env', process.env)
    res.send("Please check firebase dashboard.")
  })

export const maintenance = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    await maintenanceBells()
    console.log('maintenance')
    res.send('maintenance')
  })
