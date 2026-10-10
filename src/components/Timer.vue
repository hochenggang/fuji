<template>
  <div :class="['timer', phase]">{{ displayTime }}</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  time: {
    type: Number,
    default: 30
  },
  phase: {
    type: String,
    default: 'exercise',
    validator: (value) => ['exercise', 'rest'].includes(value)
  }
})

const displayTime = computed(() => props.time)
</script>

<style scoped>
.timer {
  font-size: 4.5rem;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
}

.timer.exercise {
  color: var(--accent);
}

.timer.rest {
  color: var(--rest);
}

@media (max-width: 600px) {
  .timer {
    font-size: 3.5rem;
  }
}
</style>
