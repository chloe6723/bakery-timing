const items = require('../../config/market-items')
const economyService = require('../../services/economy-service')
Page({
  data: { coins: 1280, category: '装饰', categories: ['食谱', '装饰', '包装', '设备', '二手收购'], items },
  onShow() { this.setData({ coins: economyService.balance().coins }); if (this.getTabBar()) this.getTabBar().setData({ selected: 2 }) },
  setCategory(event) { this.setData({ category: event.currentTarget.dataset.category }) },
  buy(event) {
    const item = this.data.items.find(candidate => candidate.id === event.currentTarget.dataset.id)
    const result = economyService.purchase(item)
    if (!result.ok) return wx.showToast({ title: '金币还不够', icon: 'none' })
    this.setData({ coins: result.economy.coins })
    wx.showToast({ title: '已收入仓库', icon: 'success' })
  },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
