const focusService = require('./services/focus-service')

App({
  onShow() { focusService.current(Date.now()) },
  onHide() { focusService.background(Date.now()) }
})
