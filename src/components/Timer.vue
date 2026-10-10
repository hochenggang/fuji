<template>
  <div :class="['timer', phase]">{{ time }}</div>
</template>

<script setup>
defineProps({
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
