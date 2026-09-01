const defaults = require('../config/defaults')
const storage = require('./storage')

function clone(value) { return JSON.parse(JSON.stringify(value)) }
function getUser() { return storage.get(storage.KEYS.USER, clone(defaults.user)) }
function saveUser(user) { return storage.set(storage.KEYS.USER, user) }
function getEconomy() { return storage.get(storage.KEYS.ECONOMY, clone(defaults.economy)) }
function saveEconomy(economy) { return storage.set(storage.KEYS.ECONOMY, economy) }
function getInventory() { return storage.get(storage.KEYS.INVENTORY, clone(defaults.inventory)) }
function saveInventory(inventory) { return storage.set(storage.KEYS.INVENTORY, inventory) }
function getSettings() { return storage.get(storage.KEYS.SETTINGS, clone(defaults.settings)) }
function saveSettings(settings) { return storage.set(storage.KEYS.SETTINGS, settings) }
function getActiveSession() { return storage.get(storage.KEYS.ACTIVE_SESSION, null) }
function saveActiveSession(session) { return storage.set(storage.KEYS.ACTIVE_SESSION, session) }
function clearActiveSession() { storage.remove(storage.KEYS.ACTIVE_SESSION) }
function appendLedger(entry) {
  const ledger = storage.get(storage.KEYS.LEDGER, [])
  if (ledger.some(item => item.id === entry.id)) return ledger
  ledger.unshift(entry); return storage.set(storage.KEYS.LEDGER, ledger)
}
function appendSessionHistory(session) {
  const history = storage.get(storage.KEYS.SESSION_HISTORY, [])
  if (history.some(item => item.id === session.id)) return history
  history.unshift(session); return storage.set(storage.KEYS.SESSION_HISTORY, history)
}
module.exports = { getUser, saveUser, getEconomy, saveEconomy, getInventory, saveInventory,
  getSettings, saveSettings, getActiveSession, saveActiveSession, clearActiveSession,
  appendLedger, appendSessionHistory }
