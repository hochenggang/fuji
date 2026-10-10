<template>
  <div class="completion-screen">
    <div class="completion-icon">🎉</div>
    <h2 class="completion-title">训练完成！</h2>
    <p class="completion-stats">恭喜你完成了{{ courseName }}</p>
    <p class="completion-time">总时长：{{ durationMinutes }}分钟</p>
    <button class="restart-btn" @click="$emit('restart')">再来一次</button>
  </div>
</template>

<script setup>
defineProps({
  courseName: {
    type: String,
    default: ''
  },
  durationMinutes: {
    type: Number,
    default: 0
  }
})

defineEmits(['restart'])
</script>

<style scoped>
.completion-screen {
  text-align: center;
  padding: 20px 0;
}

.completion-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
}

.completion-title {
  font-size: 1.75rem;
  margin-bottom: 12px;
  color: var(--success);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.completion-stats {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 4px;
}

.completion-time {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  margin-bottom: 32px;
}

.restart-btn {
  padding: 14px 40px;
  font-size: 1rem;
  font-weight: 500;
  background: var(--accent);
  border: none;
  color: #fff;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-md);
}

.restart-btn:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.restart-btn:active {
  transform: translateY(0);
}
</style>
