const { RECIPES, matchRecipe } = require('../../domain/recipes')
const focusService = require('../../services/focus-service')
const economyService = require('../../services/economy-service')
const focusDomain = require('../../domain/focus-session')
const settlementService = require('../../services/settlement-service')
const retailService = require('../../services/retail-service')
const settingsService = require('../../services/settings-service')

Page({
  data: { coins: 1280, minutes: 30, recipe: RECIPES[0], recipes: RECIPES },
  onShow() {
    const active = focusService.current(Date.now())
    const dailyVisit = retailService.scheduleDailyVisit(Date.now())
    const settings = settingsService.get().settings
    if (settings.operationMode === 'managed') {
      if (dailyVisit) retailService.checkout(dailyVisit.id, Date.now() + 1)
      retailService.runManagedSale(Date.now() + 2)
    }
    this.setData({ coins: economyService.balance().coins })
    if (active && !focusDomain.isTerminal(active)) {
      setTimeout(() => wx.navigateTo({ url: '/pages/focus/focus?resume=1' }), 50)
    } else if (active && active.status === focusDomain.SESSION_STATUS.ABANDONED && active.failureReason === 'FOCUS_MODE_BACKGROUND_TIMEOUT') {
      settlementService.abandon(active, Date.now())
      wx.showModal({ title: '制作已经停止', content: `专注模式离开超过三分钟，${active.failureItem}已经放进仓库。`, showCancel: false,
        complete: () => focusService.archiveTerminal(active) })
    }
  },
  chooseMinutes(event) {
    const minutes = Number(event.currentTarget.dataset.minutes)
    this.setData({ minutes, recipe: matchRecipe(minutes) })
  },
  slideMinutes(event) {
    const minutes = Number(event.detail.value)
    this.setData({ minutes, recipe: matchRecipe(minutes) })
  },
  openCatalog() { wx.navigateTo({ url: '/pages/catalog/catalog' }) },
  openSettings() { wx.navigateTo({ url: '/pages/settings/settings' }) },
  openLedger() { wx.switchTab({ url: '/pages/ledger/ledger' }) },
  openOrders() { wx.switchTab({ url: '/pages/orders/orders' }) },
  openMarket() { wx.switchTab({ url: '/pages/market/market' }) },
  openShowcase() { wx.navigateTo({ url: '/pages/showcase/showcase' }) },
  startFocus() {
    focusService.start(this.data.minutes, Date.now())
    wx.navigateTo({ url: '/pages/focus/focus?resume=1' })
  }
})
