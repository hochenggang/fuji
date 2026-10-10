import { ref, onUnmounted } from 'vue'

const BASE_BEAT_INTERVAL_MS = 1000

export function useSynthesizedAudio() {
  const audioContext = ref(null)
  const tickInterval = ref(null)
  const isPlaying = ref(false)
  const isRestMode = ref(false)
  const beatIntervalMs = ref(BASE_BEAT_INTERVAL_MS)

  // 发声边界：仅训练会话内允许出声。prepare() 开启会话，stop() 封闭；
  // 封闭后 play/resume 均为空操作，避免会话收尾状态的翻转误触发声音。
  let isActive = false
  let isPaused = false
  let hasBegun = false

  function initAudioContext() {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }
  }

  function playTickSound(restMode = false) {
    if (!audioContext.value) return

    const osc = audioContext.value.createOscillator()
    const gain = audioContext.value.createGain()

    if (restMode) {
      osc.frequency.value = 1200
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.03, audioContext.value.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.05)
    } else {
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.45, audioContext.value.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.08)
    }

    osc.connect(gain)
    gain.connect(audioContext.value.destination)

    osc.start(audioContext.value.currentTime)
    osc.stop(audioContext.value.currentTime + (restMode ? 0.06 : 0.1))
  }

  function clearTickInterval() {
    if (tickInterval.value) {
      clearInterval(tickInterval.value)
      tickInterval.value = null
    }
  }

  function scheduleTicks() {
    tickInterval.value = setInterval(() => {
      playTickSound(isRestMode.value)
    }, beatIntervalMs.value)
  }

  function startTicking() {
    initAudioContext()
    isPlaying.value = true
    playTickSound(isRestMode.value)
    scheduleTicks()
  }

  // 会话开始（点击开始训练）：仅准备音频上下文，不出声
  function prepare() {
    initAudioContext()
    isActive = true
    isPaused = false
    hasBegun = false
  }

  // 视频就绪后开始滴答；暂停中先记录已就绪，待恢复时补上
  function play() {
    if (!isActive) return
    hasBegun = true
    if (isPaused || isPlaying.value) return
    startTicking()
  }

  function pause() {
    if (!isActive) return
    isPaused = true
    clearTickInterval()
    isPlaying.value = false
  }

  function resume() {
    if (!isActive) return
    isPaused = false
    if (!hasBegun || isPlaying.value) return
    startTicking()
  }

  // 会话结束（结束/完成）：清定时器、关上下文，并封闭声音边界
  function stop() {
    isActive = false
    isPaused = false
    hasBegun = false
    clearTickInterval()
    isPlaying.value = false
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
  }

  function setRestMode(restMode) {
    isRestMode.value = restMode
  }

  function setBeatMultiplier(multiplier) {
    beatIntervalMs.value = BASE_BEAT_INTERVAL_MS / multiplier
    if (tickInterval.value) {
      clearTickInterval()
      scheduleTicks()
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    play,
    pause,
    resume,
    stop,
    prepare,
    setRestMode,
    setBeatMultiplier
  }
}
