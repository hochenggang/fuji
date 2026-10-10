<template>
  <div class="training-screen">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
    </div>
    
    <div class="content-card">
      <div class="step-indicator-row">
        <button class="step-nav-btn" type="button" aria-label="上一项" @click="$emit('prev')">&lt;</button>
        <p class="step-indicator">第 {{ currentStepIndex + 1 }} / {{ totalSteps }} 个动作</p>
        <button class="step-nav-btn" type="button" aria-label="下一项" @click="$emit('next')">&gt;</button>
      </div>
      <h2 class="step-name">{{ step.name }}</h2>
      <p class="target-muscles">{{ step.targetMuscles.join(' · ') }}</p>

      <VideoPlayer 
        :key="step.id"
        :src="step.video"
        @ready="onVideoReady"
      />

      <!-- 静默预加载下一个动作的视频，让下一次休息免于缓冲等待 -->
      <video
        v-if="nextStep && !isWaitingForVideo"
        :src="nextStep.video"
        class="prefetch-video"
        preload="auto"
        muted
        playsinline
      />

      <div class="timer-section">
        <Timer :time="timeRemaining" :phase="phase" />
        <span :class="['phase-indicator', phase]">
          {{ phaseLabel }}
        </span>
      </div>

      <TipsBox :tips="step.tips" />

      <div class="control-buttons">
        <button class="control-btn primary" @click="$emit('pause')">
          {{ isPaused ? '继续' : '暂停' }}
        </button>
        <button class="control-btn" @click="$emit('stop')">结束</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { exerciseSteps, TOTAL_STEPS } from '../data/exercises.js'
import Timer from './Timer.vue'
import TipsBox from './TipsBox.vue'
import VideoPlayer from './VideoPlayer.vue'

const props = defineProps({
  currentStepIndex: {
    type: Number,
    default: 0
  },
  step: {
    type: Object,
    required: true
  },
  timeRemaining: {
    type: Number,
    default: 30
  },
  isExercising: {
    type: Boolean,
    default: true
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  currentInstruction: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0
  },
  isWaitingForVideo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pause', 'stop', 'videoReady', 'prev', 'next'])

const totalSteps = TOTAL_STEPS

const phase = computed(() => props.isExercising ? 'exercise' : 'rest')

const phaseLabel = computed(() => props.isExercising ? '练习中' : '休息 · 学习动作')

const nextStep = computed(() => exerciseSteps[props.currentStepIndex + 1] || null)

function onVideoReady() {
  emit('videoReady')
}
</script>

<style scoped>
.training-screen {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.step-indicator-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-nav-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s ease;
}

.step-nav-btn:hover {
  color: var(--text-primary);
}

.step-indicator {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.step-name {
  font-size: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
}

.target-muscles {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

.prefetch-video {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.phase-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.phase-indicator.exercise {
  background: rgba(255, 107, 53, 0.15);
  color: var(--accent);
}

.phase-indicator.rest {
  background: rgba(59, 130, 246, 0.15);
  color: var(--rest);
}

.control-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  padding-top: 8px;
}

.control-btn {
  flex: 1;
  max-width: 140px;
  padding: 12px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.control-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}

.control-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.control-btn.primary:hover {
  background: var(--accent-light);
  border-color: var(--accent-light);
}

@media (max-width: 600px) {
  .content-card {
    padding: 24px 16px;
    gap: 16px;
  }

  .step-name {
    font-size: 1.25rem;
  }

  .control-btn {
    padding: 10px 16px;
  }
}
</style>
