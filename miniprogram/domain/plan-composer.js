const { RECIPES } = require('./recipes')

function enumerate(targetMinutes, recipes, limit = 5) {
  const combinations = []
  function visit(start, items, total) {
    if (items.length && total <= targetMinutes) combinations.push({ items: [...items], usedMinutes: total, remainingMinutes: targetMinutes - total })
    if (items.length >= limit) return
    for (let index = start; index < recipes.length; index += 1) {
      const next = total + recipes[index].minutes
      if (next <= targetMinutes) visit(index, [...items, recipes[index]], next)
    }
  }
  visit(0, [], 0)
  return combinations
}

function signature(plan) { return plan.items.map(item => item.minutes).join('+') }
function recommendPlans(targetMinutes, options = {}) {
  const unlocked = options.unlockedRecipes || {}
  const counts = options.productionCounts || {}
  const mode = options.mode || 'catalog'
  const recipes = RECIPES.filter(recipe => unlocked[recipe.name] !== false)
  const plans = enumerate(targetMinutes, recipes, options.limit || 5)
  plans.sort((a, b) => {
    if (a.remainingMinutes !== b.remainingMinutes) return a.remainingMinutes - b.remainingMinutes
    if (mode === 'variety') return new Set(b.items.map(item => item.name)).size - new Set(a.items.map(item => item.name)).size
    if (mode === 'simple') return a.items.length - b.items.length
    const aCount = a.items.reduce((sum, item) => sum + (counts[item.name] || 0), 0)
    const bCount = b.items.reduce((sum, item) => sum + (counts[item.name] || 0), 0)
    if (aCount !== bCount) return aCount - bCount
    return a.items.length - b.items.length
  })
  const seen = new Set()
  return plans.filter(plan => { const key = signature(plan); if (seen.has(key)) return false; seen.add(key); return true }).slice(0, 3)
}

module.exports = { enumerate, recommendPlans }
