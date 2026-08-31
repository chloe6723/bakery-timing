Page({
  data: { coins: 1280, category: '装饰', categories: ['食谱', '装饰', '包装', '设备', '二手收购'], items: [
    { icon: '▧', name: '黄油格纹墙纸', desc: '温暖的基础款', price: 240 },
    { icon: '▤', name: '复古小烤箱', desc: '外观设备', price: 980 },
    { icon: '□', name: '牛皮纸包装袋', desc: '已拥有 0', price: 120 }
  ] },
  onShow() { this.setData({ coins: getApp().globalData.coins }) },
  setCategory(event) { this.setData({ category: event.currentTarget.dataset.category }) },
  buy(event) {
    const price = Number(event.currentTarget.dataset.price)
    if (this.data.coins < price) return wx.showToast({ title: '金币还不够', icon: 'none' })
    getApp().globalData.coins -= price
    this.setData({ coins: getApp().globalData.coins })
    wx.showToast({ title: '已收入仓库', icon: 'success' })
  },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
