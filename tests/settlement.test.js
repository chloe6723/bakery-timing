const assert = require('assert')
const memory = {}
global.wx = {
  getStorageSync(key) { return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : '' },
  setStorageSync(key, value) { memory[key] = JSON.parse(JSON.stringify(value)) },
  removeStorageSync(key) { delete memory[key] }
}

const recipes = require('../miniprogram/domain/recipes')
const focus = require('../miniprogram/domain/focus-session')
const store = require('../miniprogram/store/app-store')
const settlement = require('../miniprogram/services/settlement-service')
const settings = require('../miniprogram/services/settings-service')
const orders = require('../miniprogram/services/order-service')
const inventoryService = require('../miniprogram/services/inventory-service')

function completedSession(id, orderId = null) {
  const recipe = recipes.matchRecipe(120)
  return { ...focus.createSession(120, recipe, recipes.buildStages(recipe, 120), 0, 'healing', { orderId }),
    id, status: focus.SESSION_STATUS.COMPLETED, focusedMs: 120 * 60000, recipeElapsedMs: 125 * 60000 }
}

settings.updateSettings({ deliveryMode: 'manual' })
let result = settlement.complete(completedSession('manual-order', 'A-021'), 1000)
assert.equal(result.delivery.mode, 'manual')
assert.equal(orders.find('A-021').status, 'READY_FOR_PICKUP')
assert.equal(store.getEconomy().coins, 1280)
assert.equal(store.getInventory().breads['盐可颂'], 1)
const duplicate = settlement.complete(completedSession('manual-order', 'A-021'), 1001)
assert.equal(duplicate.duplicate, true)
assert.equal(store.getInventory().breads['盐可颂'], 1)

Math.random = () => 0.99
const delivered = orders.deliverManual('A-021', 2000)
assert.equal(delivered.ok, true)
assert.equal(delivered.tip, null)
assert.equal(store.getEconomy().coins, 1436)
assert.equal(store.getInventory().breads['盐可颂'], 0)

let abandoned = completedSession('failed-session')
abandoned.status = focus.SESSION_STATUS.ABANDONED
abandoned.failureItem = '没烤好的面包'
result = settlement.abandon(abandoned, 3000)
assert.equal(result.failedBake, '没烤好的面包')
assert.equal(store.getInventory().failedBakes['没烤好的面包'], 1)
const exchanged = inventoryService.exchangeFailedBake('没烤好的面包', 3001)
assert.equal(exchanged.ok, true)
assert.equal(exchanged.inventory.catFood, 1)

const recipe90 = recipes.matchRecipe(90)
const active = focus.createSession(90, recipe90, recipes.buildStages(recipe90, 90), 4000, 'healing')
const rescueResult = settlement.rescue(active, recipes.matchRecipe(60), 5000)
assert.equal(rescueResult.ok, true)
assert.equal(rescueResult.tickets, 1)
assert.equal(store.getInventory().breads['日式红豆包'], 1)
assert.equal(store.getCatalog().unlockedRecipes['日式红豆包'], undefined)

settings.updateSettings({ deliveryMode: 'auto' })
orders.update('A-021', { status: 'PENDING' })
result = settlement.complete(completedSession('auto-order', 'A-021'), 6000)
assert.equal(result.delivery.mode, 'auto')
assert.equal(result.delivery.animation, 'pigeon')
assert.equal(orders.find('A-021').status, 'DELIVERED')
assert.equal(store.getEconomy().coins, 1592)

console.log('settlement tests passed')
