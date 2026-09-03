const defaults = require('../config/defaults')
const storage = require('./storage')

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function getUser() { return storage.get(storage.KEYS.USER, clone(defaults.user)) }
function saveUser(user) { return storage.set(storage.KEYS.USER, user) }
function getEconomy() { return storage.get(storage.KEYS.ECONOMY, clone(defaults.economy)) }
function saveEconomy(economy) { return storage.set(storage.KEYS.ECONOMY, economy) }
function getInventory() {
  const saved = storage.get(storage.KEYS.INVENTORY, {})
  return { ...clone(defaults.inventory), ...saved, reservedBreads: { ...(saved.reservedBreads || {}) },
    failedBakes: { ...defaults.inventory.failedBakes, ...(saved.failedBakes || {}) } }
}
function saveInventory(inventory) { return storage.set(storage.KEYS.INVENTORY, inventory) }
function getSettings() { return { ...clone(defaults.settings), ...storage.get(storage.KEYS.SETTINGS, {}) } }
function saveSettings(settings) { return storage.set(storage.KEYS.SETTINGS, settings) }
function getCatalog() {
  const saved = storage.get(storage.KEYS.CATALOG, {})
  return { ...clone(defaults.catalog), ...saved,
    unlockedRecipes: { ...defaults.catalog.unlockedRecipes, ...(saved.unlockedRecipes || {}) },
    completedRecipes: { ...(saved.completedRecipes || {}) }, productionCounts: { ...(saved.productionCounts || {}) } }
}
function saveCatalog(catalog) { return storage.set(storage.KEYS.CATALOG, catalog) }
function getOrders() { return storage.get(storage.KEYS.ORDERS, clone(defaults.orders)) }
function saveOrders(orders) { return storage.set(storage.KEYS.ORDERS, orders) }
function getRetailQueue() { return storage.get(storage.KEYS.RETAIL_QUEUE, []) }
function saveRetailQueue(queue) { return storage.set(storage.KEYS.RETAIL_QUEUE, queue) }
function getAppMeta() { return storage.get(storage.KEYS.APP_META, {}) }
function saveAppMeta(meta) { return storage.set(storage.KEYS.APP_META, meta) }
function getActiveSession() { return storage.get(storage.KEYS.ACTIVE_SESSION, null) }
function saveActiveSession(session) { return storage.set(storage.KEYS.ACTIVE_SESSION, session) }
function clearActiveSession() { storage.remove(storage.KEYS.ACTIVE_SESSION) }
function appendLedger(entry) {
  const ledger = storage.get(storage.KEYS.LEDGER, [])
  if (ledger.some(item => item.id === entry.id)) return ledger
  ledger.unshift(entry); return storage.set(storage.KEYS.LEDGER, ledger)
}
function getLedger() { return storage.get(storage.KEYS.LEDGER, []) }
function appendSessionHistory(session) {
  const history = storage.get(storage.KEYS.SESSION_HISTORY, [])
  if (history.some(item => item.id === session.id)) return history
  history.unshift(session); return storage.set(storage.KEYS.SESSION_HISTORY, history)
}
module.exports = { getUser, saveUser, getEconomy, saveEconomy, getInventory, saveInventory,
  getSettings, saveSettings, getCatalog, saveCatalog, getOrders, saveOrders,
  getRetailQueue, saveRetailQueue, getAppMeta, saveAppMeta,
  getActiveSession, saveActiveSession, clearActiveSession,
  getLedger, appendLedger, appendSessionHistory }
