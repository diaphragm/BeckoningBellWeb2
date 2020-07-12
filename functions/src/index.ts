import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as Twitter from 'twitter'
import { parseTweet } from 'twitter-text'
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
const BASE_URL = ENV_CONFIG['baseUrl']
const RETWEET_INTERVAL: number = ENV_CONFIG['retweetInterval']
const EXPIRE_TIME: number = ENV_CONFIG['bellBexpirationTime']
const BELL_ATTR_LIST = ['place', 'password', 'note', 'region', 'silencedAt']

const TwitterClient = new Twitter(functions.config().twitter)


// util function

const genTweetUrl = (tweet: Twitter.ResponseData): string => {
  return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
}

const truncateTweetText = (text: string, suffix: string = '', truncationSymbol: string = '…'): string => {
  if (suffix != '' && !parseTweet(suffix).valid) throw new Error(`Suffix Length is too long.`)

  const raw = text + suffix
  if (parseTweet(raw).valid) {
    return raw
  } else {
    const { validRangeStart: start, validRangeEnd: end } = parseTweet(text)
    let [i, truncated] = [0, '']
    do {
      truncated = text.slice(start, end + 1 - i) + truncationSymbol + suffix
      i++
    } while (!parseTweet(truncated).valid)
    return truncated
  }
}

const bellDiff = (newBell: FirebaseFirestore.DocumentData, oldBell: FirebaseFirestore.DocumentData): Bell | null => {
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

const uniqeArray = (array: any[]): any[] => {
  return [...new Set(array)]
}

const mergeArray = (...arrays: any[]): any[] => {
  return uniqeArray([].concat(...arrays))
}


// function

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

const subscribeTopic = (tokens: string | string[], topics: string | string[]) => {
  let topicList: string[]
  if ('string' === typeof topics) topicList = [topics]
  else topicList = topics

  topicList.forEach(topic => {
    admin.messaging().subscribeToTopic(tokens, topic)
    .then(response => {
      console.log('subscribe topic', {tokens, topic})
    })
    .catch(error => {
      console.error('subscribe topic', error)
    })
  })
}

const unsubscribeTopic = (tokens: string | string[], topics: string | string[]) => {
  let topicList: string[]
  if ('string' === typeof topics) topicList = [topics]
  else topicList = topics

  topicList.forEach(topic => {
    admin.messaging().unsubscribeFromTopic(tokens, topic)
      .then(response => {
        console.log('unsubscribe topic', { tokens, topic })
      })
      .catch(error => {
        console.error('unsubscribe topic', error)
      })
  })
}

const sendNewBell = (bell: FirebaseFirestore.QueryDocumentSnapshot) => {
  const id = bell.id
  const { place, note } = bell.data() || {}
  const title = `鐘Web|${place || ''}で鐘が鳴っています。`
  const body = `${note || ''}`
  const url = `${BASE_URL}/${id}`

  const notification = {
    title: title,
    body: body
  }

  const payload: admin.messaging.Message = {
    topic: 'bells',
    notification: notification,
    webpush: {
      notification: notification,
      fcmOptions: {
        link: url
      }
    }
  }

  return admin.messaging().send(payload)
}

const sendNewMessage = async (message: FirebaseFirestore.QueryDocumentSnapshot) => {
  const bell = await message.ref.parent.parent?.get()
  if ('undefined' === typeof bell) {
    console.error('parent bell not found', message)
    return 1
  }

  const bellId = bell.id
  const {place} = bell.data() || {}
  const {body, type, hunter} = message.data() || {}
  const url = `${BASE_URL}/${bellId}`
  const title = `鐘Web|${place}`

  const notification: {[key: string]: string|undefined} = {
    title: title
  }
  switch (type) {
    case 'text':
      notification.body = `${hunter.name}\n「${body}」`
      break
    case 'stamp':
      notification.body = `${hunter.name}`
      notification.image = `${BASE_URL}/stamps/${body}`
      break
    case 'system':
      notification.body = body.replace('<br>', '\n')
      break
  }

  const payload: admin.messaging.Message = {
    topic: bellId,
    notification: notification,
    webpush: {
      headers: {
        TTL: '60'
      },
      notification: notification,
      fcmOptions: {
        link: url
      }
    }
  }

  return admin.messaging().send(payload)
}


// trigger

export const onCreatedBellTritter = functions
  .region(REGION)
  .firestore
  .document('bells/{bellId}')
  .onCreate((snap, context) => {
    const id = snap.id
    const {place, note} = snap.data() || {}
    const url = `${BASE_URL}/${id}`
    const message = `${place}で鐘を鳴らしています。\n${url}\n${note}`

    TwitterClient.post('statuses/update', {
      status: truncateTweetText(message),
    }).then(tweet => {
      const tweetUrl = genTweetUrl(tweet)
      return admin.firestore().collection('bells').doc(snap.id).update({
        tweetUrl: tweetUrl
      })
    }).catch(error => {
      console.error(error)
    })

    sendNewBell(snap).catch(error => {
      console.error(error)
    })

    return 0
  })

export const onUpdatedBellTrigger = functions
  .region(REGION)
  .firestore
  .document('bells/{bellId}')
  .onUpdate((change, context) => {
    const bellId: string = context.params.bellId
    const newData = change.after.data()
    const oldData = change.before.data()

    const diff = bellDiff(newData, oldData)
    const interval = newData.updatedAt.seconds - oldData.updatedAt.seconds

    if (diff) {
      if (diff.silencedAt || interval > RETWEET_INTERVAL) {
        const { place, note, tweetUrl } = newData || {}
        const url = `${BASE_URL}/${bellId}`
        const message = diff.silencedAt ?
          `【終了】 募集は終了しました` :
          `【更新】 ${place}で鐘を鳴らしています。 ${url}\n${note}`
        const tweetId = tweetUrl ? tweetUrl.match(/\d+$/)[0] : ''

        TwitterClient.post('statuses/update', {
          status: truncateTweetText(message, ' ' + tweetUrl),
          in_reply_to_status_id: tweetId
        }).catch(error => {
          console.error(error)
        })
      }

      if (diff.silencedAt) {
        admin.firestore().collection('hunters').where('subscriptions', 'array-contains', bellId)
        .get().then(snap => {
          const tokens = snap.docs.map(doc => doc.data().token)
          unsubscribeTopic(tokens, bellId)
        }).catch(error => {
          console.error(error)
        })
      }
    }

    return 0
  })

export const onCreatedMessageTrigger = functions
  .region(REGION)
  .firestore
  .document('bells/{bellId}/messages/{messageId}')
  .onCreate((snap, context) => {
    sendNewMessage(snap).catch(error => {
      console.error(error)
    })

    return 0
  })

export const onUpdatedHunterTrigger = functions
  .region(REGION)
  .firestore
  .document('hunters/{hunterId}')
  .onUpdate((change, context) => {
    const newToken: string = change.after.data().token
    const oldToken: string = change.before.data().token
    const newSubs: string[] = change.after.data().subscriptions || []
    const oldSubs: string[] = change.before.data().subscriptions || []

    if (newToken === oldToken) {
      mergeArray(newSubs, oldSubs).forEach((topic: string) => {
        const newState = newSubs.includes(topic)
        const oldState = oldSubs.includes(topic)
        if (newState && !oldState) {
          subscribeTopic(newToken, topic)
        } else if (!newState && oldState) {
          unsubscribeTopic(newToken, topic)
        }
      })
    } else {
      unsubscribeTopic(oldToken, oldSubs)
      subscribeTopic(newToken, newSubs)
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
