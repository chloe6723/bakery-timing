const settingsService = require('../../services/settings-service')
Page({
  data: { mode: '治愈', sound: false, vibration: false, deliveryMode: 'manual', operationMode: 'self', recommendationMode: 'catalog', goal: '完成任意一次专注' },
  onLoad() { const data = settingsService.get(); this.setData({ mode: data.user.mode === 'focus' ? '专注' : '治愈', ...data.settings }) },
  toggleMode() { const mode = this.data.mode === '治愈' ? '专注' : '治愈'; settingsService.setMode(mode === '专注' ? 'focus' : 'healing'); this.setData({ mode }) },
  toggleSound(event) { const sound = event.detail.value; settingsService.updateSettings({ sound }); this.setData({ sound }) },
  toggleVibration(event) { const vibration = event.detail.value; settingsService.updateSettings({ vibration }); this.setData({ vibration }) },
  toggleDelivery() { const deliveryMode = this.data.deliveryMode === 'manual' ? 'auto' : 'manual'; settingsService.updateSettings({ deliveryMode }); this.setData({ deliveryMode }) },
  toggleOperation() { const operationMode = this.data.operationMode === 'self' ? 'managed' : 'self'; settingsService.updateSettings({ operationMode }); this.setData({ operationMode }) },
  cycleRecommendation() { const modes = ['catalog', 'variety', 'simple']; const recommendationMode = modes[(modes.indexOf(this.data.recommendationMode) + 1) % modes.length]; settingsService.updateSettings({ recommendationMode }); this.setData({ recommendationMode }) },
  back() { wx.navigateBack() }
})
