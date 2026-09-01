const focusService = require('../../services/focus-service')
const orderService = require('../../services/order-service')
Page({
  data: { filter: '全部', filters: ['全部', '即时 VIP', '单次预约', '周期订单', '零售'] },
  onShow() { if (this.getTabBar()) this.getTabBar().setData({ selected: 1 }); this.setData({ orders: orderService.list() }) },
  setFilter(event) { this.setData({ filter: event.currentTarget.dataset.filter }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) },
  startVip() { focusService.start(120, Date.now(), { orderId: 'A-021' }); wx.navigateTo({ url: '/pages/focus/focus?resume=1' }) },
  deliver(event) {
    const result = orderService.deliverManual(event.currentTarget.dataset.id)
    if (!result.ok) return wx.showToast({ title: '订单还没有备好', icon: 'none' })
    wx.showModal({ title: `${result.order.customer}来取面包了`, content: `${result.encouragement}\n获得 ${result.coins} 金币${result.tip ? `，小费：${result.tip}` : '。今天没有特别小费。'}`, showCancel: false })
    this.setData({ orders: orderService.list() })
  }
})
