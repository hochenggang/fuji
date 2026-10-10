import { watch, onUnmounted } from 'vue'

const STORAGE_KEY = 'training_records'
const UPDATE_INTERVAL_MS = 200

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export function useTrainingRecords(isTraining, currentStepIndex, stepSegment) {
  const records = loadRecords()
  let sessionKey = null
  let activeSegment = null
  let heartbeatTimer = null

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  function updateRecord() {
    if (sessionKey === null) return

    const now = Math.floor(Date.now() / 1000)
    const steps = records[sessionKey]

    if (activeSegment !== stepSegment.value) {
      if (activeSegment !== null && steps.length > 0) {
        // 关掉上一段（含未做完的），时间线不留缺口
        steps[steps.length - 1].end_ts = now
      }
      activeSegment = stepSegment.value
      steps.push({ start_ts: now, end_ts: now, step_index: currentStepIndex.value })
    } else {
      steps[steps.length - 1].end_ts = now
    }

    saveRecords()
  }

  function startSession() {
    endSession()
    activeSegment = null
    sessionKey = String(Math.floor(Date.now() / 1000))
    records[sessionKey] = []
    updateRecord()
    heartbeatTimer = setInterval(updateRecord, UPDATE_INTERVAL_MS)
  }

  function endSession() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (sessionKey !== null) {
      updateRecord()
      sessionKey = null
    }
  }

  function getSessions() {
    return Object.keys(records)
      .map((key) => ({ startTs: Number(key), steps: records[key] }))
      .sort((a, b) => b.startTs - a.startTs)
  }

  watch(isTraining, (training) => {
    if (training) {
      startSession()
    } else {
      endSession()
    }
  })

  // 跳转瞬间立即落盘，未做完的片段时间精确截止到跳转时刻
  watch([currentStepIndex, stepSegment], () => {
    updateRecord()
  })

  onUnmounted(() => {
    endSession()
  })

  return { getSessions }
}
