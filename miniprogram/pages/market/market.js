const items = require('../../config/market-items')
const economyService = require('../../services/economy-service')
const inventoryService = require('../../services/inventory-service')
Page({
  data: { coins: 1280, catFood: 0, failedBakes: {}, category: '装饰', categories: ['食谱', '装饰', '包装', '设备', '二手收购'], items },
  onShow() { const inventory = inventoryService.get(); this.setData({ coins: economyService.balance().coins, catFood: inventory.catFood, failedBakes: inventory.failedBakes }); if (this.getTabBar()) this.getTabBar().setData({ selected: 2 }) },
  setCategory(event) { this.setData({ category: event.currentTarget.dataset.category }) },
  buy(event) {
    const item = this.data.items.find(candidate => candidate.id === event.currentTarget.dataset.id)
    const result = economyService.purchase(item)
    if (!result.ok) return wx.showToast({ title: '金币还不够', icon: 'none' })
    this.setData({ coins: result.economy.coins })
    wx.showToast({ title: '已收入仓库', icon: 'success' })
  },
  exchangeCatFood(event) {
    const result = inventoryService.exchangeFailedBake(event.currentTarget.dataset.item)
    if (!result.ok) return wx.showToast({ title: '仓库里没有这件失败品', icon: 'none' })
    this.setData({ catFood: result.inventory.catFood, failedBakes: result.inventory.failedBakes })
    wx.showToast({ title: '已兑换 1 份猫粮', icon: 'success' })
  },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
