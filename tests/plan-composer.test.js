const assert = require('assert')
const { RECIPES } = require('../miniprogram/domain/recipes')
const { recommendPlans } = require('../miniprogram/domain/plan-composer')

const unlocked = Object.fromEntries(RECIPES.map(recipe => [recipe.name, true]))
const plans = recommendPlans(300, { unlockedRecipes: unlocked, productionCounts: {}, mode: 'variety' })
assert.equal(plans.length, 3)
assert.equal(plans[0].remainingMinutes, 0)
assert.ok(plans[0].items.length <= 5)
assert.equal(plans[0].items.reduce((sum, item) => sum + item.minutes, 0), 300)
const timeline = require('../miniprogram/domain/recipes').buildPlanStages(plans[0].items, 300)
assert.equal(timeline.filter(stage => stage.focus).reduce((sum, stage) => sum + stage.minutes, 0), 300)

const seventyFive = recommendPlans(75, { unlockedRecipes: unlocked, productionCounts: {}, mode: 'simple' })
assert.equal(seventyFive[0].usedMinutes, 60)
assert.equal(seventyFive[0].remainingMinutes, 15)
assert.equal(seventyFive[0].items[0].name, '日式红豆包')

console.log('plan-composer tests passed')
