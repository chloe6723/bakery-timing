const store = require('../store/app-store')
const TIP_TABLE = [
  { name: '石头', weight: 30 }, { name: '种子', weight: 25 }, { name: '粘土', weight: 18 },
  { name: '花', weight: 14 }, { name: '向日葵', weight: 10 }, { name: '宝石', weight: 3 }
]
function list() { return store.getOrders() }
function find(id) { return list().find(order => order.id === id) || null }
function update(id, patch) {
  const orders = list().map(order => order.id === id ? { ...order, ...patch } : order)
  store.saveOrders(orders); return orders.find(order => order.id === id)
}
function randomTip() {
  if (Math.random() >= 0.25) return null
  let roll = Math.random() * 100
  for (const tip of TIP_TABLE) { roll -= tip.weight; if (roll <= 0) return tip.name }
  return TIP_TABLE[0].name
}
function deliverManual(orderId, now = Date.now()) {
  const order = find(orderId)
  if (!order || order.status !== 'READY_FOR_PICKUP') return { ok: false, reason: 'NOT_READY' }
  const inventory = store.getInventory()
  if ((inventory.breads[order.recipe] || 0) < 1) return { ok: false, reason: 'NO_RESERVED_BREAD' }
  inventory.breads[order.recipe] -= 1
  const tip = randomTip()
  if (tip) inventory.gifts[tip] = (inventory.gifts[tip] || 0) + 1
  store.saveInventory(inventory)
  const economy = store.getEconomy(); economy.coins += order.price; store.saveEconomy(economy)
  store.appendLedger({ id: `order-delivery:${order.id}`, type: 'ORDER_DELIVERY', amount: order.price,
    balance: economy.coins, orderId: order.id, createdAt: now })
  update(order.id, { status: 'DELIVERED', deliveredAt: now, tip })
  return { ok: true, order, tip, coins: order.price, encouragement: order.encouragement }
}
module.exports = { list, find, update, deliverManual }
