const store = require('../store/app-store')
function get() { return store.getInventory() }
function exchangeFailedBake(itemName, now = Date.now()) {
  const inventory = store.getInventory()
  if ((inventory.failedBakes[itemName] || 0) < 1) return { ok: false, reason: 'NO_FAILED_BAKE', inventory }
  inventory.failedBakes[itemName] -= 1
  inventory.catFood += 1
  store.saveInventory(inventory)
  store.appendLedger({ id: `cat-food:${itemName}:${now}`, type: 'FAILED_BAKE_TO_CAT_FOOD', amount: 0,
    label: itemName, createdAt: now })
  return { ok: true, inventory }
}
module.exports = { get, exchangeFailedBake }
