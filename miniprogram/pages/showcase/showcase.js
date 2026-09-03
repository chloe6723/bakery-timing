const retailService = require('../../services/retail-service')
const store = require('../../store/app-store')
Page({
  data: { featured: [], more: [], expanded: false, queue: [], total: 0 },
  onShow() { this.refresh() },
  refresh() { const shelf = retailService.shelf(); this.setData({ ...shelf, queue: store.getRetailQueue() }) },
  toggleMore() { this.setData({ expanded: !this.data.expanded }) },
  moveUp(event) { const index = Number(event.currentTarget.dataset.index); if (index > 0) retailService.moveDisplay(index, index - 1); this.refresh() },
  checkout(event) { const result = retailService.checkout(event.currentTarget.dataset.id); if (!result.ok) return wx.showToast({ title: '这份面包已经售完', icon: 'none' }); wx.showModal({ title: `${result.visit.customer}结账完成`, content: `买走${result.visit.bread}，获得 ${result.visit.price} 金币${result.tip ? `，小费：${result.tip}` : ''}。`, showCancel: false }); this.refresh() },
  back() { wx.navigateBack() }
})
