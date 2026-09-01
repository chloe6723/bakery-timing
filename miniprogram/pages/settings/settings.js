const settingsService = require('../../services/settings-service')
Page({
  data: { mode: '治愈', sound: false, vibration: false, goal: '完成任意一次专注' },
  onLoad() { const data = settingsService.get(); this.setData({ mode: data.user.mode === 'focus' ? '专注' : '治愈', ...data.settings }) },
  toggleMode() { const mode = this.data.mode === '治愈' ? '专注' : '治愈'; settingsService.setMode(mode === '专注' ? 'focus' : 'healing'); this.setData({ mode }) },
  toggleSound(event) { const sound = event.detail.value; settingsService.updateSettings({ sound }); this.setData({ sound }) },
  toggleVibration(event) { const vibration = event.detail.value; settingsService.updateSettings({ vibration }); this.setData({ vibration }) },
  back() { wx.navigateBack() }
})
