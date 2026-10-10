<template>
  <div class="container">
    <button
      v-if="!isTraining"
      class="records-btn"
      type="button"
      aria-label="训练记录"
      @click="openRecords"
    >
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path d="M409.709989 71.493018h204.879992v51.195001H409.709989z" fill="currentColor"/>
        <path d="M798.871985 1024H225.327995c-70.593106 0-127.987501-57.394395-127.987501-127.987501V199.480519c0-70.593106 57.394395-127.987501 127.987501-127.987501h47.795333v51.195001h-47.795333c-42.39586 0-76.792501 34.496631-76.7925 76.7925V895.912509c0 42.39586 34.496631 76.792501 76.7925 76.7925h573.54399c42.39586 0 76.792501-34.496631 76.792501-76.7925V199.480519c0-42.39586-34.496631-76.792501-76.792501-76.7925h-47.795332V71.493018h47.795332c70.593106 0 127.987501 57.394395 127.987501 127.987501V895.912509c0.09999 70.693096-57.394395 128.087491-127.987501 128.087491z" fill="currentColor"/>
        <path d="M317.319012 0.09999h51.195v184.381994h-51.195zM657.785763 0.09999H708.980764v184.381994h-51.195001zM268.623767 319.368812h480.553071v51.195H268.623767zM268.623767 522.44898h480.553071v51.195H268.623767zM268.623767 729.828728h316.669075v51.195H268.623767z" fill="currentColor"/>
      </svg>
    </button>

    <header v-if="!isTraining">
      <h1>{{ currentCourse.name }}</h1>
      <p class="subtitle">{{ currentCourse.desc }} · {{ currentCourse.steps.length }}个动作</p>
    </header>

    <div class="main-content">
      <div v-if="!isTraining && !isCompleted" class="setup-screen">
        <CourseSelector v-model="currentCourseId" />
        <DifficultySelector v-model="currentDifficulty" />
        <button class="start-btn" @click="handleStart">开始训练</button>
      </div>

      <TrainingScreen
        v-if="isTraining"
        :current-step-index="currentStepIndex"
        :step="currentStep"
        :steps="currentCourse.steps"
        :time-remaining="timeRemaining"
        :is-exercising="isExercising"
        :is-paused="isPaused"
        :current-instruction="currentInstruction"
        :progress="progress"
        :is-waiting-for-video="isWaitingForVideo"
        @pause="handlePause"
        @stop="stopTraining"
        @prev="prevStep"
        @next="nextStep"
        @video-ready="handleVideoReady"
      />

      <CompletionScreen
        v-if="isCompleted"
        :course-name="currentCourse.name"
        :duration-minutes="courseMinutes"
        @restart="handleRestart"
      />
    </div>

    <TrainingRecords
      v-if="isRecordsOpen"
      :sessions="recordsList"
      @close="isRecordsOpen = false"
    />

    <footer class="footer">
      <p>{{ currentCourse.cr }} All Rights Reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { courses, findCourseById } from './data/index.js'
import { useTraining } from './composables/useTraining.js'
import { useSynthesizedAudio } from './composables/useSynthesizedAudio.js'
import { useTrainingRecords } from './composables/useTrainingRecords.js'
import CourseSelector from './components/CourseSelector.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import TrainingScreen from './components/TrainingScreen.vue'
import CompletionScreen from './components/CompletionScreen.vue'
import TrainingRecords from './components/TrainingRecords.vue'

const currentCourseId = ref(courses[0].id)
const currentCourse = computed(() => findCourseById(currentCourseId.value))

const {
  currentDifficulty,
  currentStepIndex,
  stepSegment,
  isExercising,
  timeRemaining,
  isPaused,
  isTraining,
  isCompleted,
  isWaitingForVideo,
  currentInstruction,
  currentStep,
  progress,
  settings,
  startTraining,
  onVideoReady,
  prevStep,
  nextStep,
  togglePause,
  stopTraining,
  resetState
} = useTraining(currentCourse)

const { play: playTicking, pause: pauseTicking, resume: resumeTicking, stop: stopTicking, prepare: prepareAudio, setRestMode, setBeatMultiplier } = useSynthesizedAudio()

const { getSessions } = useTrainingRecords({ isTraining, currentStepIndex, stepSegment, isExercising, currentCourse })

const isRecordsOpen = ref(false)
const recordsList = ref([])

const courseMinutes = computed(() =>
  Math.round((currentCourse.value.steps.length * (settings.value.exercise + settings.value.rest)) / 60)
)

function openRecords() {
  recordsList.value = getSessions()
  isRecordsOpen.value = true
}

function handleStart() {
  prepareAudio()
  setBeatMultiplier(settings.value.multiplier)
  startTraining()
}

function handleVideoReady() {
  onVideoReady()
  playTicking()
}

function handlePause() {
  togglePause()
}

watch(isPaused, (paused) => {
  if (paused) {
    pauseTicking()
  } else if (isTraining.value) {
    // 收尾时 resetState 会把 isPaused 翻回 false，此时会话已结束，不允许恢复声音
    resumeTicking()
  }
})

watch(isExercising, (exercising) => {
  setRestMode(!exercising)
}, { immediate: true })

// 声音停止的唯一边界：会话结束（主动结束或完成）
watch(isTraining, (training) => {
  if (!training) {
    stopTicking()
  }
})

// 页签标题随课程变化
watch(currentCourse, (course) => {
  document.title = `${course.name} - ${course.desc}`
}, { immediate: true })

function handleRestart() {
  resetState()
}
</script>

<style>
:root {
  --bg-primary: #0d0d0d;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2d2d2d;
  --border-color: #2d2d2d;
  --text-primary: #f0f0f0;
  --text-secondary: #888888;
  --text-tertiary: #555555;
  --accent: #ff6b35;
  --accent-light: #ff8c5a;
  --success: #22c55e;
  --rest: #3b82f6;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.records-btn {
  position: absolute;
  top: 24px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.records-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent);
}

.records-btn svg {
  width: 22px;
  height: 22px;
}

header {
  text-align: center;
  padding: 48px 0 40px;
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 12px;
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 400;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.setup-screen {
  text-align: center;
  width: 100%;
}

.start-btn {
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

.start-btn:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.start-btn:active {
  transform: translateY(0);
}

.footer {
  text-align: center;
  padding: 32px 0 16px;
  color: var(--text-tertiary);
  font-size: 0.75rem;
  letter-spacing: 0.02em;
}

@media (max-width: 600px) {
  h1 {
    font-size: 1.5rem;
  }

  .records-btn {
    top: 16px;
    right: 12px;
  }
  
  header {
    padding: 36px 0 32px;
  }

  .container {
    padding: 16px;
  }
}
</style>
