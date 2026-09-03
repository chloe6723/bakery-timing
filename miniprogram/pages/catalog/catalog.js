const { RECIPES } = require('../../domain/recipes')
const economyService = require('../../services/economy-service')
const store = require('../../store/app-store')
Page({
  data: { coins: 0, tab: '烘焙图鉴', tabs: ['烘焙图鉴', '装扮', '小物件', '客户档案', '成就徽章'], recipes: RECIPES, catalog: {}, inventory: {} },
  onShow() { this.setData({ coins: economyService.balance().coins, catalog: store.getCatalog(), inventory: store.getInventory() }) },
  setTab(event) { this.setData({ tab: event.currentTarget.dataset.tab }) },
  back() { wx.navigateBack() }
})
