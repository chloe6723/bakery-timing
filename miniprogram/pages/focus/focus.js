const focusService = require('../../services/focus-service')
const focus = require('../../domain/focus-session')

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
    clearInterval(this.timer)
    wx.showModal({ title: '贝可收好了', content: `${session.failureItem}已经放进待结算区。`, showCancel: false,
      success: () => { focusService.archiveTerminal(session); wx.reLaunch({ url: '/pages/home/home' }) } })
  },
  rescue() {
    if (!this.data.rescue) return
    wx.showModal({ title: '快速出炉规则待确认', content: `建议消耗 1 张券，获得${this.data.rescue.name}；正常售价出售，但不解锁图鉴。当前骨架暂不执行结算。`, showCancel: false })
  },
  pause() {
    if (!this.data.pauseAvailable) return wx.showToast({ title: '每专注满 1 小时可暂停一次', icon: 'none' })
    focusService.pause(Date.now()); this.refresh()
  },
  resume() { focusService.resume(Date.now()); this.refresh() },
  skipBreak() { focusService.skipBreak(Date.now()); this.refresh() },
  finishResult() { const session = this.data.session; focusService.archiveTerminal(session); wx.reLaunch({ url: '/pages/home/home' }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
