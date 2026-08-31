const { matchRecipe, rescueRecipe, buildStages } = require('../../domain/recipes')
const { createSession, formatClock } = require('../../domain/focus-session')

Page({
  data: {
    session: null,
    recipe: null,
    stageName: '准备原料',
    clock: '00:30:00',
    progress: 0,
    showExit: false,
    rescue: null,
    paused: false,
    pauseAvailable: false,
    finished: false
  },
  onLoad(query) {
    const minutes = Math.max(30, Number(query.minutes) || 30)
    const recipe = matchRecipe(minutes)
    const stages = buildStages(recipe, minutes)
    const session = createSession(minutes, recipe, stages)
    this.setData({ session, recipe, clock: formatClock(minutes * 60) })
    this.timer = setInterval(() => this.tick(), 1000)
  },
  onUnload() { clearInterval(this.timer) },
  tick() {
    if (this.data.paused || this.data.finished || this.data.showExit) return
    const session = this.data.session
    session.focusedSeconds += 1
    session.elapsedSeconds += 1
    const targetSeconds = session.targetMinutes * 60
    const progress = Math.min(100, Math.floor(session.focusedSeconds / targetSeconds * 100))
    const stageIndex = Math.min(session.stages.length - 1, Math.floor(progress / (100 / session.stages.length)))
    const rescue = rescueRecipe(Math.floor(session.focusedSeconds / 60))
    const pauseAvailable = Math.floor(session.focusedSeconds / 3600) > session.pauseCreditsUsed
    this.setData({
      session,
      progress,
      stageName: session.stages[stageIndex].name,
      clock: formatClock(targetSeconds - session.focusedSeconds),
      rescue,
      pauseAvailable
    })
    if (session.focusedSeconds >= targetSeconds) this.complete()
  },
  complete() {
    clearInterval(this.timer)
    this.setData({ finished: true, progress: 100, clock: '00:00:00', stageName: '新鲜出炉' })
  },
  askExit() { this.setData({ showExit: true }) },
  continueFocus() { this.setData({ showExit: false }) },
  abandon() {
    clearInterval(this.timer)
    const failed = this.data.progress < 50 ? '没发好的面团' : '没烤好的面包'
    wx.showModal({ title: '贝可收好了', content: `${failed}已经放进猫粮篮。`, showCancel: false, success: () => wx.reLaunch({ url: '/pages/home/home' }) })
  },
  rescue() {
    if (!this.data.rescue) return
    clearInterval(this.timer)
    wx.showModal({ title: '快速出炉', content: `消耗 1 张券，抢救出一份${this.data.rescue.name}。它可正常出售，但不进入标准图鉴。`, showCancel: false, success: () => wx.reLaunch({ url: '/pages/home/home' }) })
  },
  pause() {
    if (!this.data.pauseAvailable) return wx.showToast({ title: '每专注满 1 小时可暂停一次', icon: 'none' })
    const session = this.data.session
    session.pauseCreditsUsed += 1
    this.setData({ paused: true, session, pauseAvailable: false })
  },
  resume() { this.setData({ paused: false }) },
  goHome() { wx.reLaunch({ url: '/pages/home/home' }) }
})
