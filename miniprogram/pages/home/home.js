const { RECIPES, matchRecipe } = require('../../domain/recipes')

Page({
  data: { coins: 1280, minutes: 30, recipe: RECIPES[0], recipes: RECIPES },
  onShow() { this.setData({ coins: getApp().globalData.coins }) },
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
  startFocus() { wx.navigateTo({ url: `/pages/focus/focus?minutes=${this.data.minutes}` }) }
})
