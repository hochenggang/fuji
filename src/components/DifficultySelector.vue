<template>
  <div class="difficulty-selector">
    <p class="difficulty-label">选择训练难度</p>
    <div class="difficulty-buttons">
      <button
        v-for="(config, key) in difficultySettings"
        :key="key"
        :class="['difficulty-btn', { active: modelValue === key }]"
        @click="$emit('update:modelValue', key)"
      >
        <span class="btn-name">{{ config.name }}</span>
        <span class="btn-ratio">{{ config.ratio }} · 训练倍率{{ config.multiplier }}×</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { difficultySettings } from '../data/exercises.js'

defineProps({
  modelValue: {
    type: String,
    default: 'beginner'
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.difficulty-selector {
  margin-bottom: 48px;
  text-align: center;
  width: 100%;
}

.difficulty-label {
  font-size: 0.8125rem;
  margin-bottom: 16px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.difficulty-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.difficulty-btn {
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

.difficulty-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}

.difficulty-btn.active {
  background: var(--bg-tertiary);
  border-color: var(--accent);
  color: var(--text-primary);
  box-shadow: 0 0 0 1px var(--accent);
}

.btn-name {
  font-weight: 500;
}

.btn-ratio {
  display: block;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.difficulty-btn.active .btn-ratio {
  color: var(--accent);
}

@media (max-width: 600px) {
  .difficulty-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .difficulty-btn {
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }

  .btn-ratio {
    margin-top: 0;
  }
}
</style>
