const assert = require('assert')
const memory = {}
global.wx = {
  getStorageSync(key) { return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : '' },
  setStorageSync(key, value) { memory[key] = JSON.parse(JSON.stringify(value)) },
  removeStorageSync(key) { delete memory[key] }
}
const store = require('../miniprogram/store/app-store')
const retail = require('../miniprogram/services/retail-service')

const inventory = store.getInventory()
inventory.breads = { '香蕉巧克力布朗尼': 2, '日式红豆包': 2, '贝果': 2 }
inventory.displayOrder = ['香蕉巧克力布朗尼', '日式红豆包', '贝果']
store.saveInventory(inventory)
const first = retail.createVisit('TEST', 1)
const second = retail.createVisit('TEST', 2)
const third = retail.createVisit('TEST', 3)
assert.ok(first && second && third)
assert.equal(store.getRetailQueue().length, 3)
assert.equal(retail.createVisit('TEST', 4), null)

const sale = retail.checkout(first.id, 5)
assert.equal(sale.ok, true)
assert.equal(store.getRetailQueue().length, 2)
assert.equal(store.getEconomy().coins, 1280 + first.price)

store.saveSettings({ ...store.getSettings(), operationMode: 'managed' })
const before = retail.shelf().total
const managed = retail.runManagedSale(20)
assert.ok(managed)
assert.equal(retail.shelf().total, before - 1)

console.log('retail tests passed')
