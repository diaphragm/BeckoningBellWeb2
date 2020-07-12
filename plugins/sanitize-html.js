import Vue from 'vue'
import sanitizeHtml from 'sanitize-html'

Vue.prototype.$sanitize = function(dirty) {
  const allowedTags = sanitizeHtml.defaults.allowedTags
  const allowedAttributes = sanitizeHtml.defaults.allowedAttributes
  allowedTags.push('v-icon')
  allowedAttributes['i'] = ['class']

  return sanitizeHtml(dirty, {allowedTags, allowedAttributes})
}

Vue.prototype.$sanitizeBr = function (dirty) {
  const allowedTags = ['br']
  return sanitizeHtml(dirty, { allowedTags })
}
