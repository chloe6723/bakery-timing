const focusService = require('../../services/focus-service')
const orderService = require('../../services/order-service')
const { recommendPlans } = require('../../domain/plan-composer')
const store = require('../../store/app-store')
const residents = require('../../config/residents')
Page({
  data: { filter: '全部', filters: ['全部', '即时 VIP', '单次预约', '周期订单', '零售'], planMinutes: 300, plans: [], selectedPlan: 0 },
  onShow() { if (this.getTabBar()) this.getTabBar().setData({ selected: 1 }); this.refresh() },
  refresh() { const catalog = store.getCatalog(); const settings = store.getSettings(); const orders = orderService.list(); const active = focusService.current(Date.now()); const vipVisible = !active || active.targetFocusMs - active.focusedMs <= 60 * 60 * 1000; const plans = recommendPlans(this.data.planMinutes, { unlockedRecipes: catalog.unlockedRecipes, productionCounts: catalog.productionCounts, mode: settings.recommendationMode }); this.setData({ orders, vipOrder: orders.find(order => order.id === 'A-021'), vipVisible, plans }) },
  setPlanMinutes(event) { this.setData({ planMinutes: Number(event.detail.value), selectedPlan: 0 }); this.refresh() },
  selectPlan(event) { this.setData({ selectedPlan: Number(event.currentTarget.dataset.index) }) },
  createPlan() { const plan = this.data.plans[this.data.selectedPlan]; if (!plan) return; const customer = residents[Date.now() % residents.length]; const order = orderService.createAppointment(plan, customer); wx.showToast({ title: `已生成 ${order.items.length} 个面包`, icon: 'none' }); this.refresh() },
  setFilter(event) { this.setData({ filter: event.currentTarget.dataset.filter }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) },
  acceptVip() { orderService.update('A-021', { status: 'ACCEPTED', acceptedAt: Date.now(), startBy: Date.now() + 6 * 60 * 60 * 1000 }); wx.showToast({ title: '已接受，六小时内开始', icon: 'none' }); this.refresh() },
  startVip() { focusService.start(120, Date.now(), { orderId: 'A-021' }); orderService.update('A-021', { status: 'IN_PROGRESS' }); wx.navigateTo({ url: '/pages/focus/focus?resume=1' }) },
  startOrder(event) { const order = orderService.find(event.currentTarget.dataset.id); if (!order) return; focusService.startPlan(order, Date.now()); orderService.update(order.id, { status: 'IN_PROGRESS' }); wx.navigateTo({ url: '/pages/focus/focus?resume=1' }) },
  deliver(event) {
    const result = orderService.deliverManual(event.currentTarget.dataset.id)
    if (!result.ok) return wx.showToast({ title: '订单还没有备好', icon: 'none' })
    wx.showModal({ title: `${result.order.customer}来取面包了`, content: `${result.encouragement}\n获得 ${result.coins} 金币${result.tip ? `，小费：${result.tip}` : '。今天没有特别小费。'}${result.decoration ? `\n还收到小装饰：${result.decoration}` : ''}`, showCancel: false })
    this.setData({ orders: orderService.list() })
  }
})
