const focusService = require('../../services/focus-service')
const focus = require('../../domain/focus-session')
const settlementService = require('../../services/settlement-service')

Page({
  data: {
    session: null, recipe: null, stageName: '准备原料', stageType: 'focus',
    clock: '00:30:00', stageClock: '00:05:00', progress: 0,
    showExit: false, rescue: null, paused: false, breakActive: false,
    pauseAvailable: false, finished: false, failed: false
  },
  onLoad() {
    this.refresh()
    this.timer = setInterval(() => this.refresh(), 1000)
  },
  onShow() { if (this.loadedOnce) this.refresh(); this.loadedOnce = true },
  onHide() { focusService.background(Date.now()) },
  onUnload() { clearInterval(this.timer) },
  refresh() {
    const session = focusService.current(Date.now())
    if (!session) return wx.reLaunch({ url: '/pages/home/home' })
    const stage = focus.getCurrentStage(session)
    const remainingFocusSeconds = Math.max(0, (session.targetFocusMs - session.focusedMs) / 1000)
    const remainingStageSeconds = stage ? Math.max(0, stage.minutes * 60 - session.stageElapsedMs / 1000) : 0
    const progress = Math.floor(focus.getFocusProgress(session) * 100)
    const rescue = focusService.rescuePreview(session)
    const finished = session.status === focus.SESSION_STATUS.COMPLETED
    const failed = session.status === focus.SESSION_STATUS.ABANDONED
    this.setData({
      session, recipe: session.recipe, stageName: stage ? stage.name : (finished ? '新鲜出炉' : '制作停止'),
      stageType: stage && stage.focus ? 'focus' : 'break',
      clock: focus.formatClock(remainingFocusSeconds), stageClock: focus.formatClock(remainingStageSeconds),
      progress, rescue, paused: session.status === focus.SESSION_STATUS.MANUAL_PAUSE,
      breakActive: session.status === focus.SESSION_STATUS.RECIPE_BREAK,
      pauseAvailable: focus.availablePauseCredits(session) > 0, finished, failed
    })
    if (finished || failed) clearInterval(this.timer)
  },
  askExit() { this.setData({ showExit: true }) },
  continueFocus() { this.setData({ showExit: false }) },
  abandon() {
    const session = focusService.abandon(Date.now())
    settlementService.abandon(session, Date.now())
    clearInterval(this.timer)
    wx.showModal({ title: '贝可收好了', content: `${session.failureItem}已经放进仓库，可以稍后到集市兑换猫粮。`, showCancel: false,
      success: () => { focusService.archiveTerminal(session); wx.reLaunch({ url: '/pages/home/home' }) } })
  },
  rescue() {
    if (!this.data.rescue) return
    wx.showModal({ title: '确认快速出炉', content: `消耗 1 张券，获得${this.data.rescue.name}；可以正常出售，但不解锁图鉴。`,
      success: result => {
        if (!result.confirm) return
        const settled = settlementService.rescue(this.data.session, this.data.rescue, Date.now())
        if (!settled.ok) return wx.showToast({ title: settled.reason === 'NO_TICKET' ? '时间券不足' : '暂时无法快速出炉', icon: 'none' })
        clearInterval(this.timer)
        wx.showModal({ title: '快速出炉成功', content: `${settled.bread}已经进入仓库，还剩 ${settled.tickets} 张时间券。`, showCancel: false,
          success: () => { focusService.archiveTerminal(settled.session); wx.reLaunch({ url: '/pages/home/home' }) } })
      } })
  },
  pause() {
    if (!this.data.pauseAvailable) return wx.showToast({ title: '每专注满 1 小时可暂停一次', icon: 'none' })
    focusService.pause(Date.now()); this.refresh()
  },
  resume() { focusService.resume(Date.now()); this.refresh() },
  skipBreak() { focusService.skipBreak(Date.now()); this.refresh() },
  finishResult() {
    const session = this.data.session
    if (session.status === focus.SESSION_STATUS.ABANDONED) settlementService.abandon(session, Date.now())
    const result = session.status === focus.SESSION_STATUS.COMPLETED ? settlementService.complete(session, Date.now()) : null
    if (result && result.delivery && result.delivery.mode === 'auto') {
      return wx.showModal({ title: '鸽子已经出发', content: `包裹由信使鸽送往客户家，订单收入 ${result.delivery.coins} 金币。`, showCancel: false,
        success: () => { focusService.archiveTerminal(session); wx.reLaunch({ url: '/pages/home/home' }) } })
    }
    if (result && result.delivery && result.delivery.mode === 'manual') {
      return wx.showModal({ title: '订单已经备好', content: '面包已收入仓库。请到订单管理邀请客人来店取货。', showCancel: false,
        success: () => { focusService.archiveTerminal(session); wx.switchTab({ url: '/pages/orders/orders' }) } })
    }
    focusService.archiveTerminal(session); wx.reLaunch({ url: '/pages/home/home' })
  },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
