const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents (on, config) {},
    baseUrl: 'https://wlsf82-hacker-stories.web.app'
  }
})
