const store = require('../store/app-store')
function balance() { return store.getEconomy() }
function purchase(item, now = Date.now()) {
  const economy = store.getEconomy()
  if (economy.coins < item.price) return { ok: false, reason: 'INSUFFICIENT_COINS', economy }
  const next = { ...economy, coins: economy.coins - item.price }
  store.saveEconomy(next)
  store.appendLedger({ id: `purchase:${item.id}:${now}`, type: 'PURCHASE', amount: -item.price,
    balance: next.coins, itemId: item.id, label: item.name, createdAt: now })
  return { ok: true, economy: next }
}
module.exports = { balance, purchase }
