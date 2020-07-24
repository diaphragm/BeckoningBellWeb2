import config from './env.config.js'
import colors from 'vuetify/es5/util/colors'

const NODE_ENV = process.env.NODE_ENV

export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  head: {
    title: config[NODE_ENV].site.title || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: config[NODE_ENV].site.description || '' },
      { hid: 'og:site_name', property: 'og:site_name', content: config[NODE_ENV].site.title },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: config[NODE_ENV].site.baseUrl },
      { hid: 'og:title', property: 'og:title', content: config[NODE_ENV].site.title },
      { hid: 'og:description', property: 'og:description', content: config[NODE_ENV].site.description },
      { hid: 'og:image', property: 'og:image', content: `${config[NODE_ENV].site.baseUrl}/ogp/g_lamp.jpg` }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap'}
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#d4b505' },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/app.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/vuefire.js',
    '~/plugins/vuetify-toast-snackbar.js',
    '~/plugins/vuetify-confirm.js',
    '~/plugins/sanitize-html.js',
    '~/plugins/firestore-bbw-utils.js',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    [
      '@nuxtjs/firebase',
      {
        config: config[NODE_ENV].firebase,
        onFirebaseHosting: true,
        services: {
          auth: true,
          firestore: true,
          messaging: true,
          analytics: true
        }
      }
    ],
    [
      '@nuxtjs/google-adsense',
      config[NODE_ENV].googleAdsense
    ]
  ],
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#d4b505',
          accent: '#b9966e',
          secondary: colors.amber.darken3,
          info: '#b9966e',
          warning: colors.deepPurple.darken4,
          error: colors.deepOrange.darken4,
          success: '#d4b505'
        }
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.module.rules.push(
        { test: /\.elh$/i, use: 'elh-loader' }
      )
    },
    babel: {
      presets({ isServer }) {
        return [
          [
            // core-js@3
            require.resolve('@nuxt/babel-preset-app'),
            // require.resolve('@nuxt/babel-preset-app-edge'), // For nuxt-edge users
            {
              buildTarget: isServer ? 'server' : 'client',
              corejs: { version: 3 }
            }
          ]
        ]
      }
    },
    // 何も設定しないと`.210050b.js`みたいなファイル名になる事があるので設定する
    // アプデでそのうち直るはず
    // https://github.com/nuxt/nuxt.js/pull/7667
    filenames: {
      app: ({ isDev }) => isDev ? '[name].js' : '[contenthash].js',
      chunk: ({ isDev }) => isDev ? '[name].js' : '[contenthash].js',
      css: ({ isDev }) => isDev ? '[name].css' : '[contenthash].css',
      img: ({ isDev }) => isDev ? '[path][name].[ext]' : 'img/[contenthash:7].[ext]',
      font: ({ isDev }) => isDev ? '[path][name].[ext]' : 'fonts/[contenthash:7].[ext]',
      video: ({ isDev }) => isDev ? '[path][name].[ext]' : 'videos/[contenthash:7].[ext]'
    }
  },
  manifest: {
    gcm_sender_id: '103953800507'
  }
}
