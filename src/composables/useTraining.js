import { ref, computed, onUnmounted } from 'vue'
import { difficultySettings } from '../data/index.js'

export function useTraining(course) {
  const steps = computed(() => course.value.steps)
  const currentDifficulty = ref('beginner')
  const currentStepIndex = ref(0)
  const stepSegment = ref(0) // 每次进入某项或重做都算新一段，供训练记录切分
  const isExercising = ref(false)
  const isPaused = ref(false)
  const isTraining = ref(false)
  const isCompleted = ref(false)
  const currentInstructionIndex = ref(0)
  const isWaitingForVideo = ref(false)

  let mainTimer = null
  let instructionTimer = null

  const settings = computed(() => difficultySettings[currentDifficulty.value])

  const timeRemaining = ref(settings.value.rest)

  const currentStep = computed(() => steps.value[currentStepIndex.value])

  const progress = computed(() => {
    const { exercise, rest } = settings.value
    const totalStepTime = exercise + rest
    const elapsedInStep = isExercising.value
      ? rest + (exercise - timeRemaining.value)
      : rest - timeRemaining.value
    return ((currentStepIndex.value * totalStepTime + elapsedInStep) / (totalStepTime * steps.value.length)) * 100
  })

  const currentInstruction = computed(() => {
    if (!isExercising.value) return '观看视频，学习动作'
    return currentStep.value.steps[currentInstructionIndex.value]
  })

  function selectDifficulty(level) {
    currentDifficulty.value = level
  }

  function startTraining() {
    isTraining.value = true
    isCompleted.value = false
    jumpToStep(0)
  }

  function jumpToStep(index) {
    currentStepIndex.value = index
    stepSegment.value++
    isExercising.value = false
    timeRemaining.value = settings.value.rest
    currentInstructionIndex.value = 0
    isWaitingForVideo.value = true
  }

  function nextStep() {
    if (currentStepIndex.value >= steps.value.length - 1) {
      completeTraining()
      return
    }
    jumpToStep(currentStepIndex.value + 1)
  }

  function prevStep() {
    if (currentStepIndex.value <= 0) return
    jumpToStep(currentStepIndex.value - 1)
  }

  function onVideoReady() {
    if (isWaitingForVideo.value) {
      isWaitingForVideo.value = false
      startTimers()
    }
  }

  function startTimers() {
    clearTimers()

    mainTimer = setInterval(() => {
      if (isPaused.value || isWaitingForVideo.value) return

      timeRemaining.value--

      if (timeRemaining.value <= 0) {
        handlePhaseComplete()
      }
    }, 1000)

    instructionTimer = setInterval(() => {
      if (isPaused.value || !isExercising.value || isWaitingForVideo.value) return

      const steps = currentStep.value.steps
      currentInstructionIndex.value = (currentInstructionIndex.value + 1) % steps.length
    }, 2000)
  }

  function handlePhaseComplete() {
    if (isExercising.value) {
      nextStep()
      return
    }

    isExercising.value = true
    timeRemaining.value = settings.value.exercise
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function clearTimers() {
    if (mainTimer) {
      clearInterval(mainTimer)
      mainTimer = null
    }
    if (instructionTimer) {
      clearInterval(instructionTimer)
      instructionTimer = null
    }
  }

  function stopTraining() {
    clearTimers()
    resetState()
  }

  function completeTraining() {
    clearTimers()
    isCompleted.value = true
    isTraining.value = false
  }

  function resetState() {
    currentStepIndex.value = 0
    isExercising.value = false
    timeRemaining.value = settings.value.rest
    isPaused.value = false
    currentInstructionIndex.value = 0
    isTraining.value = false
    isCompleted.value = false
    isWaitingForVideo.value = false
  }

  onUnmounted(() => {
    clearTimers()
  })

  return {
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
    settings,
    progress,
    selectDifficulty,
    startTraining,
    onVideoReady,
    prevStep,
    nextStep,
    togglePause,
    stopTraining,
    resetState
  }
}
