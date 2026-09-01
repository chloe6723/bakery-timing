Page({
  data: { filter: '全部', filters: ['全部', '即时 VIP', '单次预约', '周期订单', '零售'] },
  onShow() { if (this.getTabBar()) this.getTabBar().setData({ selected: 1 }) },
  setFilter(event) { this.setData({ filter: event.currentTarget.dataset.filter }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) },
  startVip() { wx.navigateTo({ url: '/pages/focus/focus?minutes=120&order=A-021' }) }
})
