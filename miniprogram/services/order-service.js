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
function createAppointment(plan, customer, now = Date.now()) {
  const order = { id: `P-${now}`, type: 'APPOINTMENT', customer: customer.name, customerId: customer.id,
    minutes: plan.usedMinutes + plan.remainingMinutes, items: plan.items, recipe: plan.items.map(item => item.name).join(' + '),
    price: plan.items.reduce((sum, item) => sum + item.price, 0), status: 'PENDING', createdAt: now,
    encouragement: customer.encouragement, remainingMinutes: plan.remainingMinutes }
  store.saveOrders([order, ...list()]); return order
}
function randomTip(order) {
  const itemCount = (order.items || [{ name: order.recipe }]).length
  const base = order.type === 'VIP' ? 0.4 : order.type === 'RECURRING' ? 0.35 : 0.25
  if (Math.random() >= Math.min(0.6, base + Math.max(0, itemCount - 1) * 0.05)) return null
  let roll = Math.random() * 100
  for (const tip of TIP_TABLE) { roll -= tip.weight; if (roll <= 0) return tip.name }
  return TIP_TABLE[0].name
}
function randomDecoration(order) {
  if (order.type !== 'VIP' || Math.random() >= 0.2) return null
  const decorations = ['黄铜面包夹', '鸽子羽毛挂饰', '迷你麦穗花环', '主厨铃铛']
  return decorations[Math.floor(Math.random() * decorations.length)]
}
function deliverManual(orderId, now = Date.now()) {
  const order = find(orderId)
  if (!order || order.status !== 'READY_FOR_PICKUP') return { ok: false, reason: 'NOT_READY' }
  const inventory = store.getInventory()
  const orderItems = order.items || [{ name: order.recipe }]
  const required = orderItems.reduce((counts, item) => { counts[item.name] = (counts[item.name] || 0) + 1; return counts }, {})
  if (Object.keys(required).some(name => (inventory.reservedBreads[name] || 0) < required[name])) return { ok: false, reason: 'NO_RESERVED_BREAD' }
  Object.keys(required).forEach(name => { inventory.breads[name] -= required[name]; inventory.reservedBreads[name] -= required[name] })
  const tip = randomTip(order); const decoration = randomDecoration(order)
  if (tip) inventory.gifts[tip] = (inventory.gifts[tip] || 0) + 1
  if (decoration) inventory.trinkets[decoration] = (inventory.trinkets[decoration] || 0) + 1
  store.saveInventory(inventory)
  const economy = store.getEconomy(); economy.coins += order.price; store.saveEconomy(economy)
  store.appendLedger({ id: `order-delivery:${order.id}`, type: 'ORDER_DELIVERY', amount: order.price,
    balance: economy.coins, orderId: order.id, createdAt: now })
  update(order.id, { status: 'DELIVERED', deliveredAt: now, tip, decoration })
  return { ok: true, order, tip, decoration, coins: order.price, encouragement: order.encouragement }
}
module.exports = { list, find, update, createAppointment, deliverManual, randomDecoration }
