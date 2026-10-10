<template>
  <div class="course-selector">
    <p class="course-label">选择训练课程</p>
    <div class="course-buttons">
      <button
        v-for="course in courses"
        :key="course.id"
        :class="['course-btn', { active: modelValue === course.id }]"
        @click="$emit('update:modelValue', course.id)"
      >
        <span class="btn-name">{{ course.name }}</span>
        <span class="btn-steps">{{ course.steps.length }} 个动作</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { courses } from '../data/index.js'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.course-selector {
  margin-bottom: 32px;
  text-align: center;
  width: 100%;
}

.course-label {
  font-size: 0.8125rem;
  margin-bottom: 16px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.course-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.course-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px;
  font-size: 0.9375rem;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
}

.course-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}

.course-btn.active {
  background: var(--bg-tertiary);
  border-color: var(--accent);
  color: var(--text-primary);
  box-shadow: 0 0 0 1px var(--accent);
}

.btn-name {
  font-weight: 500;
}

.btn-steps {
  display: block;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.course-btn.active .btn-steps {
  color: var(--accent);
}

@media (max-width: 600px) {
  .course-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .course-btn {
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }

  .btn-steps {
    margin-top: 0;
  }
}
</style>
