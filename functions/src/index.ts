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
const SITE_NAME = ENV_CONFIG['siteName']
const TWITTER_USER_NAME = ENV_CONFIG['twitterUserName']
const RETWEET_INTERVAL: number = ENV_CONFIG['retweetInterval']
const EXPIRE_TIME: number = ENV_CONFIG['bellBexpirationTime']
const BELL_ATTR_LIST = ['place', 'password', 'note', 'region', 'silencedAt']

const TwitterClient = new Twitter(functions.config().twitter)


// util function

const genTweetUrl = (tweet: Twitter.ResponseData): string => {
  return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
}

const truncateTweetText = (text: string, suffix: string = '', truncationSymbol: string = '…'): string => {
  if (suffix !== '' && !parseTweet(suffix).valid) throw new Error(`Suffix Length is too long.`)

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

// request
export const bellrequest = functions
  .region('us-central1') // firebase hostingから呼ぶ場合は us-central1 限定
  .https.onRequest(async (req, res) => {
    const bellId = req.path.split('/')[1]
    const bell = await admin.firestore().collection('bells').doc(bellId).get()
    res.send(buildOgpHtml(bell))
  })

const buildOgpHtml = (bell: FirebaseFirestore.DocumentSnapshot): string => {
  if (!bell.exists) {
    return `<script>window.location="/${bell.id}/" </script>`
  }

  const bellId = bell.id
  const { place, note, silencedAt } = bell.data() || {}
  const title = silencedAt ? '募集は終了しました' : `${place}で鐘で鐘が鳴っています`
  const desctiption = silencedAt ? '募集は終了しました' : `${note}`
  const url = `${BASE_URL}/${bellId}`
  const imageUrl = `${BASE_URL}/ogp/${getOgpImage(bell)}`
  const redirectTo = `/${bellId}/`

  const html = `
    <!DOCTYPE html>
    <head prefix="og: http://ogp.me/ns#">
    <title>${SITE_NAME}</title>
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:description" content="${desctiption}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${TWITTER_USER_NAME}" />
    <meta name="twitter:creator" content="${TWITTER_USER_NAME}" />
    </head>
    <body><script>window.location="${redirectTo}"</script></body>
    </html>
  `
  return html
}

const OGP_IMAGE_LIST: {[place:string]: string[] | undefined} = {
  "嘆きの祭壇": ["altar_of_despair_1.jpg"],
  "「アメンドーズ」霧前": ["amygdara_1.jpg"],
  "時計塔": ["astral_clocktower_1.jpg"],
  "「血に渇いた獣」霧前": ["blood_starved_beast_1.jpg", "blood_starved_beast_2.jpg"],
  "ビルゲンワース": ["byrgenwerth_1.jpg"],
  "ヤーナム聖堂街": ["cathedral_ward_1.jpg"],
  "「星界からの使者」霧前": ["celestial_emissary_1.jpg"],
  "ヤーナム市街": ["central_yharnam_1.jpg"],
  "「聖職者の獣」霧前": ["cleric_beast_1.jpg", "cleric_beast_2.jpg", "cleric_beast_3.jpg"],
  "「星の娘、エーブリエタース」霧前": ["ebrietas_1.jpg", "ebrietas_2.jpg"],
  "「ガスコイン神父」霧前": ["father_gascoigne_1.jpg"],
  "漁村": ["fishing_hamlet_1.jpg"],
  "禁域の森": ["forbidden_woods_1.jpg"],
  "廃城カインハースト": ["forsaken_castle_cainhurst_1.jpg"],
  "ヘムウィックの墓地街": ["hemwick_charnel_lane_1.jpg"],
  "狩人の悪夢": ["hunters_nightmare_1.jpg"],
  "「時計塔のマリア」霧前": ["lady_maria_1.jpg"],
  "「初代教区長ローレンス」霧前": ["laurence_1.jpg", "laurence_2.jpg"],
  "灯台脇の小屋": ["lighthouse_hut_1.jpg"],
  "「失敗作たち」霧前": ["living_failures_1.jpg", "living_failures_2.jpg"],
  "「醜い獣、ルドウイーク」霧前": ["ludwig_1.jpg", "ludwig_2.jpg"],
  "「殉教者ローゲリウス」霧前": ["martyr_logarius_1.jpg", "martyr_logarius_2.jpg"],
  "メルゴーの高楼中腹": ["mergos_loft_middle_1.jpg"],
  "「悪夢の主、ミコラーシュ」霧前": ["micolash_1.jpg", "micolash_2.jpg", "micolash_3.jpg"],
  "悪夢の辺境": ["nightmare_frontier_1.jpg"],
  "メンシスの悪夢": ["nightmare_of_mensis_1.jpg"],
  "ヤーナム旧市街": ["old_yharnam_1.jpg"],
  "「再誕者」霧前": ["one_reborn_1.jpg"],
  "「ゴースの遺子」霧前": ["orphan_of_kos_1.jpg", "orphan_of_kos_2.jpg"],
  "実験棟": ["research_hall_1.jpg"],
  "「白痴の蜘蛛、ロマ」霧前": ["rom_1.jpg", "rom_2.jpg"],
  "「ヤーナムの影」霧前": ["shadow_of_yharnam.jpg"],
  "聖堂街 上層": ["upper_cathedral_ward_1.jpg"],
  "「教区長エミーリア」霧前": ["vicar_amelia_1.jpg", "vicar_amelia_2.jpg"],
  "血の女王の間": ["vileblood_queens_chamber_1.jpg"],
  "「メルゴーの乳母」霧前": ["wergos_wet_nurse_1.jpg"],
  "「ヘムウィックの魔女」霧前": ["witch_of_hemwick_1.jpg"],
  "ヤハグル教会": ["yahargul_chapel_1.jpg"],
  "隠し街ヤハグル": ["yahargul_unseen_village_1.jpg"],
  "lamp": ["g_lamp.jpg"],
  "lamp_u": ["g_lamp_2.jpg"],
  "redmoon": ["g_redmoon.jpg"],
}

const getOgpImage = (bell: FirebaseFirestore.DocumentSnapshot): string => {
  const { place, createdAt, silencedAt } = bell.data() || {}
  const key: string = silencedAt ? 'lamp_u' : place
  let ret = OGP_IMAGE_LIST[key]
  if (!ret) {
    ret = OGP_IMAGE_LIST['lamp'] || []
  }
  const i = createdAt.seconds % ret.length
  return ret[i]
}

// debug

export const maintenance = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    await maintenanceBells()
    console.log('maintenance')
    res.send('maintenance')
  })
