Page({
  data: { mode: '治愈', sound: false, vibration: false, goal: '完成任意一次专注' },
  toggleMode() { this.setData({ mode: this.data.mode === '治愈' ? '专注' : '治愈' }) },
  toggleSound(event) { this.setData({ sound: event.detail.value }) },
  toggleVibration(event) { this.setData({ vibration: event.detail.value }) },
  back() { wx.navigateBack() }
})
