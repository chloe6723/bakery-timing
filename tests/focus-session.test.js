const assert = require('assert')
const recipes = require('../miniprogram/domain/recipes')
const focus = require('../miniprogram/domain/focus-session')

const minute = 60 * 1000
const recipe120 = recipes.matchRecipe(120)
const stages120 = recipes.buildStages(recipe120, 120)
assert.equal(stages120.filter(stage => stage.focus).reduce((sum, stage) => sum + stage.minutes, 0), 120)
assert.equal(stages120.filter(stage => !stage.focus).reduce((sum, stage) => sum + stage.minutes, 0), 5)

let session = focus.createSession(120, recipe120, stages120, 0, 'healing')
session = focus.advanceSession(session, 45 * minute)
assert.equal(session.status, focus.SESSION_STATUS.RECIPE_BREAK)
assert.equal(focus.getCurrentStage(session).name, '整形休息')
assert.equal(session.focusedMs, 45 * minute)
session = focus.skipRecipeBreak(session, 46 * minute)
assert.equal(session.status, focus.SESSION_STATUS.FOCUSING)
assert.equal(focus.getCurrentStage(session).name, '第 2 次醒发')
assert.equal(session.focusedMs, 45 * minute)

const simpleStages = [{ key: 'focus', name: '专注', minutes: 120, focus: true }]
let pauseSession = focus.createSession(120, recipe120, simpleStages, 0, 'healing')
pauseSession = focus.advanceSession(pauseSession, 60 * minute)
assert.equal(focus.availablePauseCredits(pauseSession), 1)
pauseSession = focus.startManualPause(pauseSession, 60 * minute)
pauseSession = focus.advanceSession(pauseSession, 63 * minute)
assert.equal(pauseSession.status, focus.SESSION_STATUS.MANUAL_PAUSE)
pauseSession = focus.advanceSession(pauseSession, 66 * minute)
assert.equal(pauseSession.status, focus.SESSION_STATUS.FOCUSING)
assert.equal(pauseSession.focusedMs, 61 * minute)

let focusMode = focus.createSession(30, recipes.matchRecipe(30), recipes.buildStages(recipes.matchRecipe(30), 30), 0, 'focus')
focusMode = focus.markBackgrounded(focusMode, 10 * minute)
focusMode = focus.resumeFromBackground(focusMode, 13 * minute + 1000)
assert.equal(focusMode.status, focus.SESSION_STATUS.ABANDONED)
assert.equal(focusMode.failureReason, 'FOCUS_MODE_BACKGROUND_TIMEOUT')

let healingMode = focus.createSession(30, recipes.matchRecipe(30), recipes.buildStages(recipes.matchRecipe(30), 30), 0, 'healing')
healingMode = focus.markBackgrounded(healingMode, 10 * minute)
healingMode = focus.resumeFromBackground(healingMode, 20 * minute)
assert.equal(healingMode.status, focus.SESSION_STATUS.FOCUSING)
assert.equal(healingMode.focusedMs, 20 * minute)

console.log('focus-session tests passed')
