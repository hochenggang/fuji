<template>
  <div class="video-container" @click="handleClick">
    <video
      ref="videoRef"
      :src="src"
      preload="auto"
      loop
      muted
      playsinline
      webkit-playsinline
      x5-video-player-type="h5"
      x5-video-player-fullscreen="false"
      class="exercise-video"
      @playing="markReady"
      @canplaythrough="startPlayback"
      @progress="handleProgress"
      @error="markReady"
    />
    <div v-if="!isReady" class="video-overlay">
      <p class="loading-text">{{ loadingText }}</p>
      <div v-if="showPlayButton" class="play-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['ready'])

const FALLBACK_DELAY_MS = 3000
const BUFFERED_TOLERANCE_S = 0.3

const videoRef = ref(null)
const isReady = ref(false)
const showPlayButton = ref(false)
const loadingText = ref('视频缓冲中...')
const fallbackTimer = ref(null)

function markReady() {
  if (isReady.value) return
  isReady.value = true
  showPlayButton.value = false
  clearFallbackTimer()
  emit('ready')
}

function startPlayback() {
  if (isReady.value) return
  const video = videoRef.value
  if (!video) return
  video.play().then(markReady).catch(() => {
    showPlayButton.value = true
  })
}

function isFullyBuffered(video) {
  const { duration, buffered } = video
  if (!Number.isFinite(duration) || duration <= 0 || !buffered.length) return false
  return buffered.end(buffered.length - 1) >= duration - BUFFERED_TOLERANCE_S
}

function handleProgress() {
  const video = videoRef.value
  if (!video || isReady.value) return

  const { duration, buffered } = video
  if (Number.isFinite(duration) && duration > 0 && buffered.length) {
    const ratio = Math.min(1, buffered.end(buffered.length - 1) / duration)
    loadingText.value = `视频缓冲中 ${Math.round(ratio * 100)}%`
  }

  if (isFullyBuffered(video)) {
    startPlayback()
  }
}

function clearFallbackTimer() {
  if (fallbackTimer.value) {
    clearTimeout(fallbackTimer.value)
    fallbackTimer.value = null
  }
}

function scheduleFallback() {
  clearFallbackTimer()
  fallbackTimer.value = setTimeout(() => {
    if (!isReady.value) showPlayButton.value = true
  }, FALLBACK_DELAY_MS)
}

function handleClick() {
  if (!isReady.value) startPlayback()
}

function setupWeixinBridge() {
  if (typeof WeixinJSBridge === 'undefined') {
    document.addEventListener('WeixinJSBridgeReady', startPlayback, false)
  } else {
    WeixinJSBridge.invoke('getNetworkType', {}, startPlayback)
  }
}

function initVideo() {
  isReady.value = false
  showPlayButton.value = false
  loadingText.value = '视频缓冲中...'
  scheduleFallback()
}

watch(() => props.src, initVideo)

onMounted(() => {
  initVideo()
  setupWeixinBridge()
})

onUnmounted(() => {
  clearFallbackTimer()
})
</script>

<style scoped>
.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 480px;
  min-height: 120px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  background: var(--bg-tertiary);
  position: relative;
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.exercise-video {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
}

.loading-text {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.play-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease, background 0.2s ease;
}

.play-button:hover {
  transform: scale(1.1);
  background: var(--accent-light);
}

.play-button svg {
  width: 32px;
  height: 32px;
  color: #fff;
  margin-left: 4px;
}

@media (max-width: 600px) {
  .video-container {
    max-width: 100%;
  }
}
</style>
