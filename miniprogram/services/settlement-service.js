const store = require('../store/app-store')
const focus = require('../domain/focus-session')
const focusService = require('./focus-service')
const orderService = require('./order-service')

function alreadySettled(session) { return store.getLedger().some(entry => entry.id === `session-settlement:${session.id}`) }
function recordSettlement(session, kind, now) {
  store.appendLedger({ id: `session-settlement:${session.id}`, type: kind, amount: 0, sessionId: session.id, createdAt: now })
}
function complete(session, now = Date.now()) {
  if (!session || session.status !== focus.SESSION_STATUS.COMPLETED) return { ok: false, reason: 'NOT_COMPLETED' }
  if (alreadySettled(session)) return { ok: true, duplicate: true }
  const settings = store.getSettings(); const inventory = store.getInventory(); const catalog = store.getCatalog()
  catalog.unlockedRecipes[session.recipe.name] = true; store.saveCatalog(catalog)
  let delivery = null
  if (session.orderId) {
    const order = orderService.find(session.orderId)
    if (order && settings.deliveryMode === 'auto') {
      const economy = store.getEconomy(); economy.coins += order.price; store.saveEconomy(economy)
      store.appendLedger({ id: `order-delivery:${order.id}`, type: 'ORDER_AUTO_DELIVERY', amount: order.price,
        balance: economy.coins, orderId: order.id, createdAt: now })
      orderService.update(order.id, { status: 'DELIVERED', deliveredAt: now, deliveryMode: 'auto' })
      delivery = { mode: 'auto', animation: 'pigeon', coins: order.price }
    } else {
      inventory.breads[session.recipe.name] = (inventory.breads[session.recipe.name] || 0) + 1
      store.saveInventory(inventory)
      if (order) orderService.update(order.id, { status: 'READY_FOR_PICKUP', readyAt: now, deliveryMode: 'manual' })
      delivery = { mode: 'manual', status: 'READY_FOR_PICKUP' }
    }
  } else {
    inventory.breads[session.recipe.name] = (inventory.breads[session.recipe.name] || 0) + 1
    store.saveInventory(inventory)
  }
  recordSettlement(session, 'STANDARD_COMPLETION', now)
  return { ok: true, bread: session.recipe.name, catalogUnlocked: true, delivery }
}
function abandon(session, now = Date.now()) {
  if (!session || session.status !== focus.SESSION_STATUS.ABANDONED) return { ok: false, reason: 'NOT_ABANDONED' }
  if (alreadySettled(session)) return { ok: true, duplicate: true }
  const inventory = store.getInventory(); const item = session.failureItem || focus.getFailureItem(session)
  inventory.failedBakes[item] = (inventory.failedBakes[item] || 0) + 1; store.saveInventory(inventory)
  recordSettlement(session, 'FAILED_BAKE_STORED', now)
  return { ok: true, failedBake: item }
}
function rescue(session, rescueRecipe, now = Date.now()) {
  if (!session || focus.isTerminal(session) || !rescueRecipe) return { ok: false, reason: 'NOT_RESCUABLE' }
  if (alreadySettled(session)) return { ok: true, duplicate: true }
  const economy = store.getEconomy(); if (economy.tickets < 1) return { ok: false, reason: 'NO_TICKET' }
  economy.tickets -= 1; store.saveEconomy(economy)
  const inventory = store.getInventory(); inventory.breads[rescueRecipe.name] = (inventory.breads[rescueRecipe.name] || 0) + 1; store.saveInventory(inventory)
  const rescued = { ...session, status: focus.SESSION_STATUS.RESCUED, finishedAt: now,
    rescuedRecipe: rescueRecipe, settlementStatus: 'SETTLED' }
  store.saveActiveSession(rescued)
  recordSettlement(rescued, 'QUICK_BAKE_RESCUE', now)
  store.appendLedger({ id: `ticket:${session.id}`, type: 'TICKET_USED', amount: -1, sessionId: session.id, createdAt: now })
  return { ok: true, session: rescued, bread: rescueRecipe.name, tickets: economy.tickets }
}
module.exports = { complete, abandon, rescue }
