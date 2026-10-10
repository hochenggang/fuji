<template>
  <div class="records-overlay" @click.self="$emit('close')">
    <div class="records-panel">
      <div class="records-header">
        <h3>训练记录</h3>
        <button class="close-btn" type="button" aria-label="关闭" @click="$emit('close')">×</button>
      </div>

      <p v-if="!sessions.length" class="records-empty">暂无训练记录</p>

      <div v-for="session in sessions" :key="session.startTs" class="session">
        <div class="session-header">
          <span>{{ courseOf(session).name }}</span>
          <span>总用时 {{ formatDuration(sessionTotal(session)) }}</span>
        </div>
        <p class="session-date">{{ formatStart(session.startTs) }}</p>
        <ul class="step-list">
          <li v-for="(step, index) in session.steps" :key="index">
            <span>{{ stepLabel(session, index) }}</span>
            <span class="step-duration">{{ formatDuration(step.end_ts - step.start_ts) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { findCourseById } from '../data/index.js'

defineProps({
  sessions: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close'])

function courseOf(session) {
  // 旧记录没有 course 字段，回退到默认课程
  return findCourseById(session.steps[0]?.course)
}

function stepLabel(session, index) {
  const step = session.steps[index]
  const attempt = session.steps.slice(0, index + 1).filter((item) => item.step_index === step.step_index).length
  const target = courseOf(session).steps[step.step_index]
  const name = target ? target.name : `动作 ${step.step_index + 1}`
  return attempt > 1 ? `${name}（第${attempt}次）` : name
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest ? `${minutes}分${rest}秒` : `${minutes}分钟`
}

function formatStart(timestamp) {
  const date = new Date(timestamp * 1000)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function sessionTotal(session) {
  if (!session.steps.length) return 0
  return session.steps[session.steps.length - 1].end_ts - session.steps[0].start_ts
}
</script>

<style scoped>
.records-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.65);
}

.records-panel {
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px 20px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.records-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.records-header h3 {
  font-size: 1.0625rem;
  font-weight: 600;
}

.close-btn {
  padding: 0 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  color: var(--text-primary);
}

.records-empty {
  padding: 28px 0;
  color: var(--text-tertiary);
  font-size: 0.875rem;
  text-align: center;
}

.session {
  padding: 12px 0;
}

.session + .session {
  border-top: 1px solid var(--border-color);
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.session-date {
  margin-bottom: 8px;
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.step-list {
  list-style: none;
}

.step-list li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  color: var(--text-primary);
  font-size: 0.8125rem;
}

.step-duration {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
</style>
