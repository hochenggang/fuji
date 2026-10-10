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

function nowSec() {
  return Math.floor(Date.now() / 1000)
}

export function useTrainingRecords({ isTraining, currentStepIndex, stepSegment, isExercising, currentCourse }) {
  const records = loadRecords()
  let sessionKey = null
  let segmentOpen = false
  let heartbeatTimer = null

  function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  // 只有真正进入练习倒计时才算 start_ts，休息（学习动作）期间不计时
  function openSegment() {
    if (sessionKey === null || segmentOpen) return
    segmentOpen = true
    records[sessionKey].push({
      start_ts: nowSec(),
      end_ts: nowSec(),
      step_index: currentStepIndex.value,
      course: currentCourse.value.id
    })
    saveRecords()
  }

  // 关段：跳转/结束/完成时截至此刻，未做完的也忠实记录
  function closeSegment() {
    if (sessionKey === null || !segmentOpen) return
    records[sessionKey][records[sessionKey].length - 1].end_ts = nowSec()
    segmentOpen = false
    saveRecords()
  }

  function refreshSegmentEnd() {
    if (sessionKey === null || !segmentOpen) return
    records[sessionKey][records[sessionKey].length - 1].end_ts = nowSec()
    saveRecords()
  }

  function startSession() {
    endSession()
    // 同一秒内重开会话时键顺延，避免覆盖上一场记录
    let key = nowSec()
    while (records[key]) key++
    sessionKey = String(key)
    records[sessionKey] = []
    heartbeatTimer = setInterval(refreshSegmentEnd, UPDATE_INTERVAL_MS)
  }

  function endSession() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    closeSegment()
    if (sessionKey !== null) {
      // 休息期间退出、未开始任何练习的会话不入库
      if (records[sessionKey].length === 0) {
        delete records[sessionKey]
        saveRecords()
      }
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

  // 跳转瞬间先关段，未做完的片段时间精确截止到跳转时刻
  watch([currentStepIndex, stepSegment], () => {
    closeSegment()
  })

  // 练习倒计时开始的一刻开段
  watch(isExercising, (exercising) => {
    if (exercising) {
      openSegment()
    }
  })

  onUnmounted(() => {
    endSession()
  })

  return { getSessions }
}
