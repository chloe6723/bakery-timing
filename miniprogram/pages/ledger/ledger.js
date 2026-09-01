Page({
  data: { range: '日', ranges: ['日', '周', '月', '年', '全部'] },
  onShow() { if (this.getTabBar()) this.getTabBar().setData({ selected: 0 }) },
  setRange(event) { this.setData({ range: event.currentTarget.dataset.range }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
