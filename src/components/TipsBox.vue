<template>
  <div class="tips-box">
    <ul class="tips-list">
      <li v-for="(tip, index) in tips" :key="index">{{ tip }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  tips: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.tips-box {
  background: var(--bg-tertiary);
  padding: 16px 20px;
  border-radius: var(--radius-md);
  text-align: left;
  width: 100%;
}

.tips-list {
  list-style: none;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.tips-list li {
  margin-bottom: 6px;
  padding-left: 16px;
  position: relative;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.tips-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
}
</style>
