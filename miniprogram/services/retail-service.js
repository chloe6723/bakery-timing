const store = require('../store/app-store')
const residents = require('../config/residents')
const { RECIPES } = require('../domain/recipes')

function totalStock(inventory) { return Object.values(inventory.breads).reduce((sum, value) => sum + value, 0) }
function reservedCounts(queue) {
  return queue.reduce((counts, visit) => { counts[visit.bread] = (counts[visit.bread] || 0) + 1; return counts }, {})
}
function availableBreads(inventory, queue = []) {
  const reserved = reservedCounts(queue)
  return inventory.displayOrder.filter(name => (inventory.breads[name] || 0) - (inventory.reservedBreads[name] || 0) - (reserved[name] || 0) > 0)
}
function chooseResident(indexSeed = Date.now()) { return residents[Math.abs(indexSeed) % residents.length] }
function chooseBread(resident, available) {
  return resident.preference.find(name => available.includes(name)) || available[0] || null
}
function createVisit(reason = 'RANDOM', now = Date.now()) {
  const inventory = store.getInventory(); const queue = store.getRetailQueue()
  if (queue.length >= 3) return null
  const available = availableBreads(inventory, queue); if (!available.length) return null
  const resident = chooseResident(now); const bread = chooseBread(resident, available)
  const visit = { id: `retail-${now}`, residentId: resident.id, customer: resident.name, bread,
    price: (RECIPES.find(recipe => recipe.name === bread) || { price: 30 }).price, reason, status: 'WAITING', createdAt: now }
  store.saveRetailQueue([...queue, visit]); return visit
}
function tipForRetail(now) {
  const gifts = ['石头', '种子', '粘土', '花', '向日葵', '宝石']
  return now % 4 === 0 ? gifts[now % gifts.length] : null
}
function checkout(visitId, now = Date.now()) {
  const queue = store.getRetailQueue(); const visit = queue.find(item => item.id === visitId)
  if (!visit) return { ok: false, reason: 'VISIT_NOT_FOUND' }
  const inventory = store.getInventory(); if ((inventory.breads[visit.bread] || 0) < 1) return { ok: false, reason: 'SOLD_OUT' }
  inventory.breads[visit.bread] -= 1
  const tip = tipForRetail(now); if (tip) inventory.gifts[tip] = (inventory.gifts[tip] || 0) + 1
  store.saveInventory(inventory); store.saveRetailQueue(queue.filter(item => item.id !== visitId))
  const economy = store.getEconomy(); economy.coins += visit.price; store.saveEconomy(economy)
  store.appendLedger({ id: `retail-sale:${visit.id}`, type: 'RETAIL_SALE', amount: visit.price,
    balance: economy.coins, bread: visit.bread, customer: visit.customer, tip, createdAt: now })
  return { ok: true, visit, tip, balance: economy.coins }
}
function runManagedSale(now = Date.now()) {
  const settings = store.getSettings(); const inventory = store.getInventory()
  if (settings.operationMode !== 'managed' || totalStock(inventory) <= 4) return null
  const visit = createVisit('MANAGED', now); return visit ? checkout(visit.id, now + 1) : null
}
function scheduleDailyVisit(now = Date.now()) {
  const day = new Date(now).toISOString().slice(0, 10); const meta = store.getAppMeta()
  if (meta.lastDailyVisitDay === day) return null
  meta.lastDailyVisitDay = day; store.saveAppMeta(meta)
  return createVisit('FIRST_OPEN', now)
}
function shelf() {
  const inventory = store.getInventory()
  const all = inventory.displayOrder.filter(name => (inventory.breads[name] || 0) - (inventory.reservedBreads[name] || 0) > 0)
  const quantity = name => inventory.breads[name] - (inventory.reservedBreads[name] || 0)
  return { featured: all.slice(0, 8).map(name => ({ name, quantity: quantity(name) })),
    more: all.slice(8).map(name => ({ name, quantity: quantity(name) })), total: all.reduce((sum, name) => sum + quantity(name), 0) }
}
function moveDisplay(fromIndex, toIndex) {
  const inventory = store.getInventory(); const order = [...inventory.displayOrder]
  const [item] = order.splice(fromIndex, 1); if (!item) return order
  order.splice(toIndex, 0, item); inventory.displayOrder = order; store.saveInventory(inventory); return order
}
module.exports = { totalStock, availableBreads, createVisit, checkout, runManagedSale, scheduleDailyVisit, shelf, moveDisplay }
