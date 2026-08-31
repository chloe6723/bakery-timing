const RECIPES = [
  { minutes: 30, name: '香蕉巧克力布朗尼', price: 30, proofCount: 0 },
  { minutes: 60, name: '日式红豆包', price: 66, proofCount: 1 },
  { minutes: 90, name: '贝果', price: 108, proofCount: 1 },
  { minutes: 120, name: '盐可颂', price: 156, proofCount: 2 },
  { minutes: 150, name: '吐司', price: 210, proofCount: 2 },
  { minutes: 180, name: '全麦欧包', price: 270, proofCount: 3 }
]

function matchRecipe(minutes) {
  return [...RECIPES].reverse().find(item => minutes >= item.minutes) || null
}

function rescueRecipe(actualFocusMinutes) {
  const matchedIndex = RECIPES.findIndex(item => item === matchRecipe(actualFocusMinutes))
  return matchedIndex > 0 ? RECIPES[matchedIndex - 1] : null
}

function buildStages(recipe, targetMinutes) {
  if (!recipe) return []
  if (recipe.proofCount === 0) {
    return [
      { key: 'prepare', name: '准备原料', minutes: 5, focus: true },
      { key: 'mix', name: '混合面糊', minutes: 10, focus: true },
      { key: 'bake', name: '烘焙', minutes: Math.max(15, targetMinutes - 15), focus: true }
    ]
  }
  const fixedFocus = 15 + recipe.proofCount * 30
  const stages = [
    { key: 'prepare', name: '准备原料', minutes: 5, focus: true },
    { key: 'knead', name: '揉制面团', minutes: 10, focus: true }
  ]
  for (let i = 0; i < recipe.proofCount; i += 1) {
    stages.push({ key: `proof-${i + 1}`, name: i ? `第 ${i + 1} 次醒发` : '醒发', minutes: 30, focus: true })
    if (i < recipe.proofCount - 1) stages.push({ key: `shape-${i + 1}`, name: '整形休息', minutes: 5, focus: false, skippable: true })
  }
  stages.push({ key: 'bake', name: '烘焙', minutes: Math.max(1, targetMinutes - fixedFocus), focus: true })
  return stages
}

module.exports = { RECIPES, matchRecipe, rescueRecipe, buildStages }
