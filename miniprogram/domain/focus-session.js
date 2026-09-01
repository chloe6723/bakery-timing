const SESSION_STATUS = {
  FOCUSING: 'FOCUSING', RECIPE_BREAK: 'RECIPE_BREAK', MANUAL_PAUSE: 'MANUAL_PAUSE',
  COMPLETED: 'COMPLETED', ABANDONED: 'ABANDONED', RESCUED: 'RESCUED'
}
const BACKGROUND_GRACE_MS = 3 * 60 * 1000
const MANUAL_PAUSE_MS = 5 * 60 * 1000

function createSession(targetMinutes, recipe, stages, now = Date.now(), mode = 'healing', context = {}) {
  return {
    id: `focus-${now}`, version: 1,
    status: stages[0] && stages[0].focus ? SESSION_STATUS.FOCUSING : SESSION_STATUS.RECIPE_BREAK,
    mode, targetMinutes, targetFocusMs: targetMinutes * 60 * 1000, focusedMs: 0,
    recipeElapsedMs: 0, stageIndex: 0, stageElapsedMs: 0, pauseCreditsUsed: 0,
    pauseEndsAt: null, resumeStatus: null, backgroundedAt: null,
    lastEvaluatedAt: now, startedAt: now, finishedAt: null,
    recipe, stages, orderId: context.orderId || null, settlementStatus: 'PENDING'
  }
}

function isTerminal(session) {
  return [SESSION_STATUS.COMPLETED, SESSION_STATUS.ABANDONED, SESSION_STATUS.RESCUED].includes(session.status)
}
function stageDurationMs(stage) { return stage.minutes * 60 * 1000 }
function syncStageStatus(session) {
  const stage = session.stages[session.stageIndex]
  session.status = stage ? (stage.focus ? SESSION_STATUS.FOCUSING : SESSION_STATUS.RECIPE_BREAK) : SESSION_STATUS.COMPLETED
}

function advanceSession(source, now = Date.now()) {
  const session = { ...source }
  if (isTerminal(session) || now <= session.lastEvaluatedAt) return session
  let cursor = session.lastEvaluatedAt
  if (session.status === SESSION_STATUS.MANUAL_PAUSE) {
    if (now < session.pauseEndsAt) { session.lastEvaluatedAt = now; return session }
    cursor = session.pauseEndsAt
    session.pauseEndsAt = null
    session.status = session.resumeStatus || SESSION_STATUS.FOCUSING
    session.resumeStatus = null
  }
  let remainingMs = now - cursor
  while (remainingMs > 0 && !isTerminal(session)) {
    const stage = session.stages[session.stageIndex]
    if (!stage) { session.status = SESSION_STATUS.COMPLETED; session.finishedAt = cursor; break }
    const availableMs = stageDurationMs(stage) - session.stageElapsedMs
    const consumedMs = Math.min(availableMs, remainingMs)
    session.stageElapsedMs += consumedMs
    session.recipeElapsedMs += consumedMs
    if (stage.focus) session.focusedMs += consumedMs
    remainingMs -= consumedMs
    cursor += consumedMs
    if (session.stageElapsedMs >= stageDurationMs(stage)) {
      session.stageIndex += 1
      session.stageElapsedMs = 0
      if (session.stageIndex >= session.stages.length) {
        session.status = SESSION_STATUS.COMPLETED
        session.finishedAt = cursor
      } else syncStageStatus(session)
    }
  }
  session.lastEvaluatedAt = now
  return session
}

function availablePauseCredits(session) {
  return Math.max(0, Math.floor(session.focusedMs / (60 * 60 * 1000)) - session.pauseCreditsUsed)
}
function startManualPause(source, now = Date.now()) {
  let session = advanceSession(source, now)
  if (session.status !== SESSION_STATUS.FOCUSING || availablePauseCredits(session) < 1) return session
  session = { ...session, resumeStatus: session.status, status: SESSION_STATUS.MANUAL_PAUSE,
    pauseCreditsUsed: session.pauseCreditsUsed + 1, pauseEndsAt: now + MANUAL_PAUSE_MS, lastEvaluatedAt: now }
  return session
}
function resumeManualPause(source, now = Date.now()) {
  if (source.status !== SESSION_STATUS.MANUAL_PAUSE) return advanceSession(source, now)
  return { ...source, status: source.resumeStatus || SESSION_STATUS.FOCUSING,
    resumeStatus: null, pauseEndsAt: null, lastEvaluatedAt: now }
}
function skipRecipeBreak(source, now = Date.now()) {
  let session = advanceSession(source, now)
  if (session.status !== SESSION_STATUS.RECIPE_BREAK) return session
  session = { ...session, stageIndex: session.stageIndex + 1, stageElapsedMs: 0, lastEvaluatedAt: now }
  syncStageStatus(session)
  return session
}
function markBackgrounded(source, now = Date.now()) {
  const session = advanceSession(source, now)
  if (!isTerminal(session)) session.backgroundedAt = now
  return session
}
function resumeFromBackground(source, now = Date.now()) {
  if (!source.backgroundedAt || isTerminal(source)) return advanceSession(source, now)
  if (source.mode === 'focus' && now - source.backgroundedAt > BACKGROUND_GRACE_MS) {
    const session = { ...source, status: SESSION_STATUS.ABANDONED, finishedAt: now,
      failureReason: 'FOCUS_MODE_BACKGROUND_TIMEOUT', backgroundedAt: null, lastEvaluatedAt: now }
    session.failureItem = getFailureItem(session)
    return session
  }
  const session = advanceSession(source, now)
  session.backgroundedAt = null
  return session
}
function abandonSession(source, now = Date.now(), reason = 'USER_ABANDONED') {
  const session = advanceSession(source, now)
  session.status = SESSION_STATUS.ABANDONED
  session.finishedAt = now
  session.failureReason = reason
  session.failureItem = getFailureItem(session)
  return session
}
function getRecipeProgress(session) {
  const totalMs = session.stages.reduce((sum, stage) => sum + stageDurationMs(stage), 0)
  return totalMs ? Math.min(1, session.recipeElapsedMs / totalMs) : 0
}
function getFocusProgress(session) { return session.targetFocusMs ? Math.min(1, session.focusedMs / session.targetFocusMs) : 0 }
function getFailureItem(session) { return getRecipeProgress(session) < 0.5 ? '没发好的面团' : '没烤好的面包' }
function getCurrentStage(session) { return session.stages[session.stageIndex] || null }
function formatClock(totalSeconds) {
  const value = Math.max(0, Math.ceil(totalSeconds)); const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60); const seconds = value % 60
  return [hours, minutes, seconds].map(part => String(part).padStart(2, '0')).join(':')
}

module.exports = { SESSION_STATUS, BACKGROUND_GRACE_MS, MANUAL_PAUSE_MS, createSession,
  advanceSession, availablePauseCredits, startManualPause, resumeManualPause,
  skipRecipeBreak, markBackgrounded, resumeFromBackground, abandonSession,
  getFailureItem, getRecipeProgress, getFocusProgress, getCurrentStage, isTerminal, formatClock }
