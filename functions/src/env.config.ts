export const config: {[env: string]: object} = {
  staging: {
    region: 'asia-northeast1',
    baseUrl: "https://beckoningbellweb-staging.web.app",
    retweetInterval: 1 * 60, // seconds
    bellBexpirationTime: 1 * 60 // seconds
  },
  producntion: {
    region: 'asia-northeast1',
    baseUrl: "https://beckoningbellweb.web.app",
    retweetInterval: 1 * 60, // seconds
    bellBexpirationTime: 60 * 60 // seconds
  }
}
