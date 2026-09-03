const { matchRecipe, rescueRecipe, buildStages, buildPlanStages } = require('../domain/recipes')
const focus = require('../domain/focus-session')
const store = require('../store/app-store')

function start(targetMinutes, now = Date.now(), context = {}) {
  const active = store.getActiveSession()
  if (active && !focus.isTerminal(active)) return active
  const recipe = matchRecipe(targetMinutes)
  const user = store.getUser()
  const session = focus.createSession(targetMinutes, recipe, buildStages(recipe, targetMinutes), now, user.mode, context)
  store.saveActiveSession(session)
  return session
}
function startPlan(order, now = Date.now()) {
  const active = store.getActiveSession()
  if (active && !focus.isTerminal(active)) return active
  const user = store.getUser(); const items = order.items || []
  const recipe = { name: '预约烘焙计划', price: items.reduce((sum, item) => sum + item.price, 0) }
  const session = focus.createSession(order.minutes, recipe, buildPlanStages(items, order.minutes), now, user.mode, { orderId: order.id })
  session.planItems = items; store.saveActiveSession(session); return session
}
function current(now = Date.now()) {
  const active = store.getActiveSession(); if (!active) return null
  const session = active.backgroundedAt ? focus.resumeFromBackground(active, now) : focus.advanceSession(active, now)
  store.saveActiveSession(session); return session
}
function background(now = Date.now()) {
  const active = store.getActiveSession(); if (!active || focus.isTerminal(active)) return active
  const session = focus.markBackgrounded(active, now); store.saveActiveSession(session); return session
}
function pause(now = Date.now()) { const session = focus.startManualPause(current(now), now); store.saveActiveSession(session); return session }
function resume(now = Date.now()) { const session = focus.resumeManualPause(current(now), now); store.saveActiveSession(session); return session }
function skipBreak(now = Date.now()) { const session = focus.skipRecipeBreak(current(now), now); store.saveActiveSession(session); return session }
function abandon(now = Date.now()) { const session = focus.abandonSession(current(now), now); store.saveActiveSession(session); return session }
function rescuePreview(session) { return rescueRecipe(Math.floor(session.focusedMs / 60000)) }
function archiveTerminal(session) {
  if (!session || !focus.isTerminal(session)) return
  store.appendSessionHistory(session)
  store.clearActiveSession()
}
module.exports = { start, startPlan, current, background, pause, resume, skipBreak, abandon, rescuePreview, archiveTerminal }
