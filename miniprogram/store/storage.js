const KEYS = {
  USER: 'bakeryTiming:user', ECONOMY: 'bakeryTiming:economy', INVENTORY: 'bakeryTiming:inventory',
  SETTINGS: 'bakeryTiming:settings', CATALOG: 'bakeryTiming:catalog', ORDERS: 'bakeryTiming:orders', ACTIVE_SESSION: 'bakeryTiming:activeSession',
  SESSION_HISTORY: 'bakeryTiming:sessionHistory', LEDGER: 'bakeryTiming:ledger'
}
function get(key, fallback) {
  try { const value = wx.getStorageSync(key); return value === '' || value == null ? fallback : value } catch (error) { return fallback }
}
function set(key, value) { wx.setStorageSync(key, value); return value }
function remove(key) { wx.removeStorageSync(key) }
module.exports = { KEYS, get, set, remove }
