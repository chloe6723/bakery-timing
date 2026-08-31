const { RECIPES } = require('../../domain/recipes')
Page({
  data: { tab: '成品橱窗', tabs: ['成品橱窗', '礼物仓库', '购买仓库', '客户档案', '成就徽章'], recipes: RECIPES },
  setTab(event) { this.setData({ tab: event.currentTarget.dataset.tab }) },
  back() { wx.navigateBack() }
})
