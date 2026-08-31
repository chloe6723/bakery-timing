function createSession(targetMinutes, recipe, stages) {
  return {
    id: `local-${Date.now()}`,
    status: 'FOCUSING',
    targetMinutes,
    focusedSeconds: 0,
    elapsedSeconds: 0,
    pauseCreditsUsed: 0,
    recipe,
    stages,
    startedAt: Date.now()
  }
}

function formatClock(totalSeconds) {
  const value = Math.max(0, totalSeconds)
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = value % 60
  return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':')
}

module.exports = { createSession, formatClock }
