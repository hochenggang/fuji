import { ref, onUnmounted } from 'vue'

const BASE_BEAT_INTERVAL_MS = 1000

export function useSynthesizedAudio() {
  const audioContext = ref(null)
  const tickInterval = ref(null)
  const isPlaying = ref(false)
  const isRestMode = ref(false)
  const beatIntervalMs = ref(BASE_BEAT_INTERVAL_MS)

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

  function scheduleTicks() {
    tickInterval.value = setInterval(() => {
      playTickSound(isRestMode.value)
    }, beatIntervalMs.value)
  }

  function startTicking() {
    isPlaying.value = true
    playTickSound(isRestMode.value)
    scheduleTicks()
  }

  function play() {
    initAudioContext()

    if (isPlaying.value) return

    startTicking()
  }

  function prepare() {
    initAudioContext()
  }

  function pause() {
    if (tickInterval.value) {
      clearInterval(tickInterval.value)
      tickInterval.value = null
    }
    isPlaying.value = false
  }

  function resume() {
    if (!audioContext.value) {
      play()
      return
    }

    if (isPlaying.value) return

    initAudioContext()
    startTicking()
  }

  function stop() {
    pause()
    isRestMode.value = false
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
      clearInterval(tickInterval.value)
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
