module.exports = {
  user: { bakeryName: '贝可的面包房', mode: 'healing', dailyGoal: { type: 'completion', value: 1 } },
  economy: { coins: 1280, tickets: 2 },
  inventory: { breads: {}, failedBakes: { '没发好的面团': 0, '没烤好的面包': 0 }, catFood: 0, gifts: {}, purchases: {} },
  catalog: { unlockedRecipes: {} },
  settings: { sound: false, vibration: false, notificationPrompted: false, deliveryMode: 'manual' },
  orders: [
    { id: 'A-021', type: 'VIP', customer: '鹿小姐', recipe: '盐可颂', minutes: 120, status: 'PENDING', price: 156, encouragement: '你的认真，让今天的麦子星也变得香喷喷。' },
    { id: 'R-118', type: 'RECURRING', customer: '阅读论文', recipe: null, minutes: 90, status: 'PENDING', price: 0 }
  ]
}
