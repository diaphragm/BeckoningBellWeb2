export const config: {[env: string]: object} = {
  staging: {
    region: 'asia-northeast1',
    baseUrl: 'https://staging-bloodborne.9kv.org',
    siteName: '[STG] 狩人呼びの鐘Web The Old Hunters',
    twitterUserName: '@BbwDev',
    retweetInterval: 1 * 60, // seconds
    bellBexpirationTime: 1 * 60 // seconds
  },
  production: {
    region: 'asia-northeast1',
    baseUrl: 'https://bloodborne.9kv.org',
    siteName: '狩人呼びの鐘Web The Old Hunters',
    twitterUserName: '@BloodborneVoyyy',
    retweetInterval: 5 * 60, // seconds
    bellBexpirationTime: 60 * 60 // seconds
  }
}
